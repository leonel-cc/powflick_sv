import { Body, Controller, Get, HttpException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExcelProductsService } from './excel-products.service';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { SheetsProductsDto } from './dto/sheetsProductsDto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { GetUser } from '../auth/decorator/auth-user.decorator';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { Rol } from '../users/entity/users.entity';
import { RolesGuard } from '../auth/guards/rolesGuard';
import { Roles } from '../auth/decorator/roles.decorator';

@ApiTags('Excel Products')
@Controller('excel-products')
export class ExcelProductsController {
  constructor(private readonly excelProductsService: ExcelProductsService) { }

  @ApiOperation({
    description:
      "Mediante éste 'endPoint' es posible cargar / actualizar los productos de la base de datos, es importante que la url del excel que enviemos tengan estos datos: \n" + SheetsProductsDto.getDescription(),
  })
  @ApiResponse({
    status: 201,
    description: 'Productos creados / actualizados con éxito!',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  @Post('')
  async excelToDatabase(
  @Body('url') url: string,
    @Req() req: Request,
  ) {
    req.setTimeout(1200000); //20 min
    const sheetsData: GoogleSpreadsheet = await this.excelProductsService.getSheetsData(url);

    const jsonData: any = await this.excelProductsService.spreadSheetsToJSON(sheetsData);

    const response = await this.excelProductsService.JsonToDatabase(jsonData);

    return response;
  }

  @ApiOperation({
    description: 'Exportar datos a un archivo Excel.',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos exportados correctamente.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  @Get('')
  async exportToExcel(@Res() res: Response) {
    // Recuperar datos de la base de datos utilizando el servicio
    const products = await this.excelProductsService.getExportProducts();

    // Convertir los datos a un archivo Excel utilizando exceljs o alguna otra biblioteca
    const buffer = await this.excelProductsService.exportProductsToExcel(products);

    // Establecer las cabeceras de respuesta para el tipo de contenido y la descarga del archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=exported_products.xlsx');
    // Enviar el archivo Excel como respuesta
    res.json(buffer);
  }

  @ApiOperation({
    description: 'Exportar productos a un archivo Excel compatible con Google Merchant Center.',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo Excel generado correctamente.',
  })
  @Get('merchant')
  async exportToMerchantExcel(@Res() res: Response) {
    // Obtener los productos desde la base de datos
    const products = await this.excelProductsService.getExportProducts();

    // Generar el archivo Excel
    const buffer = await this.excelProductsService.exportProductsToExcelMerchant(products);

    // Configurar cabeceras de respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=merchant_products.xlsx');

    // Enviar el archivo como respuesta
    res.send(buffer);
  }
}
