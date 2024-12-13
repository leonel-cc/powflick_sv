import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ContactType, Messages } from './entity/messages.entity';
import { Op, Sequelize } from 'sequelize';
import { MailService } from '../mail/mail.service';
import { IContactFormResponseContext } from '../mail/interfaces/contact-form-response-context.interface';
import { Cases } from '../mail/dto/sendMail.dto';
import { User } from 'src/users/entity/users.entity';
import { Conversation } from './entity/conversationMessage';
import { IGetUser } from 'src/auth/interfaces/getUser.interface';

@Injectable()
export class MessagesService {
  constructor(private readonly mailService: MailService) { }

  async create(messageData: Partial<Messages>) {
    try {
      await Messages.create(messageData);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'The message has been sent successfully',
      };
    } catch (error) {
      throw new HttpException('There was an error sending the message' + error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getCategoryTotals() {
    try {
      // Obtén el total de mensajes por cada categoría y si hay algún mensaje sin respuesta en cada categoría
      const categoryCounts = await Messages.findAll({
        attributes: [
          'category',
          [Sequelize.fn('COUNT', Sequelize.col('category')), 'count'],
          [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN "response" IS NULL THEN 1 ELSE 0 END')), 'nullResponses'],
        ],
        group: ['category'],
      });

      const categoryImages: { [key: string]: string[] } = {};

      for (const categoryCount of categoryCounts) {
        const cat = categoryCount.category;
        const nullResponses = parseInt(categoryCount.getDataValue('nullResponses'), 10) > 0;

        if (nullResponses) {
          const categoryMessages = await Messages.findAll({
            where: { category: cat, response: null },
            limit: 6, // Limita a 6 usuarios
          });

          const images: string[] = [];

          for (const message of categoryMessages) {
            const user = await User.findOne({ where: { email: message.email } });
            if (user) {
              images.push(user.image);
            }
          }
          categoryImages[cat] = images;
        } else {
          categoryImages[cat] = []; // Si no hay mensajes sin respuesta, establece un array vacío
        }
      }

      // Inicializa el resultado con todas las categorías, incluso las que no tienen mensajes
      const result = Object.values(ContactType).reduce((acc, cat) => {
        acc[cat] = [0, false, []];
        return acc;
      }, {});

      // Actualiza el resultado con los datos obtenidos
      categoryCounts.forEach(item => {
        const cat = item.category;
        const count = parseInt(item.getDataValue('count'), 10);
        const hasNullResponses = parseInt(item.getDataValue('nullResponses'), 10) > 0;
        const images = categoryImages[cat] || [];
        result[cat] = [count, hasNullResponses, images];
      });

      return result;
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(
    order: string,
    limit: number,
    page: number,
    category: string,
    filter: string | null = null,
    search: string | null = null,
    answered: boolean | null = null,
  ) {
    try {
      let orderClause: any[] = [];
      let where: any = {};

      // Aplica el filtro si está presente
      if (filter && search) {
        where = { [filter]: { [Op.iLike]: `%${search}%` } };
      } else if (search) {
        // Si se proporciona solo el término de búsqueda pero no el filtro, busca en todos los campos
        where = {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        };
      }

      // Agrega la condición para verificar si el mensaje ha sido respondido o no
      if (answered !== null) {
        where.pending = !answered;
      }

      // Filtra por la categoría proporcionada
      if (category) {
        where.category = category;
      }

      // Ordena los mensajes por el atributo especificado o por fecha de creación si no hay filtro
      if (order) {
        const columnToOrder = filter || 'consultedAt';
        orderClause = [[columnToOrder, order]];
      }

      // Obtén el total de mensajes que cumplen con los criterios de búsqueda
      const totalMessages = await Messages.count({ where });

      // Calcula el total de páginas
      const totalPages = Math.ceil(totalMessages / limit);

      // Realiza la consulta para obtener los mensajes con paginación
      const messages = await Messages.findAll({
        where,
        include: [
          {
            model: Conversation,
            attributes: ['text', 'imgUrl', 'name', 'createdAt'], // Especifica los atributos que deseas incluir
          },
        ],
        order: orderClause,
        limit,
        offset: (page - 1) * limit,
      });

      // Construye el resultado con la información de paginación y los mensajes
      const result = {
        prevPage: page === 1 ? null : page - 1,
        page,
        nextPage: page === totalPages ? null : page + 1,
        totalPages,
        total: totalMessages,
        messages,
      };

      return result;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async findOne(id: string) {
    try {
      return await Messages.findByPk(id, {
        include: [
          {
            model: Conversation,
            attributes: ['text', 'imgUrl', 'name', 'createdAt', 'from'], // Especifica los atributos que deseas incluir
          },
        ],
      });
    } catch (error) {
      throw new HttpException('There was an error searching for the message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, messageData: Partial<Messages>) {
    try {
      const [rowsUpdated] = await Messages.update(messageData, { where: { id } });
      if (rowsUpdated === 0) {
        throw new HttpException('The message could not be updated', HttpStatus.NOT_FOUND);
      }
      const updatedMessage = await Messages.findByPk(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'The message has been updated successfully',
        updatedMessage,
      };
    } catch (error) {
      throw new HttpException('There was an error updating the message', HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string) {
    try {
      const message = await Messages.findByPk(id);
      if (!message) {
        throw new HttpException('The message could not be found', HttpStatus.NOT_FOUND);
      }
      await message.destroy();
      return {
        statusCode: HttpStatus.OK,
        message: 'The message has been successfully deleted',
      };
    } catch (error) {
      throw new HttpException('There was an error deleting the message', HttpStatus.BAD_REQUEST);
    }
  }

  async addConversation(
    messageId: string,
    data: Partial<Conversation>,
    user: IGetUser,
  ) {
    const admin = data.from === 'admin';
    try {
      const message = await this.findOne(messageId);
      const u = await User.findOne({ where: { email: user.userEmail } });
      if (!message) {
        throw new Error('Message not found');
      }

      if (admin) {
        const context: IContactFormResponseContext = {
          name: message.name,
          userEmail: message.email,
          message: message.message,
          response: data.text,
        };

        await this.mailService.sendMails({
          EmailAddress: context.userEmail,
          context,
          subject: Cases.CONTACT_FORM_RESPONSE,
        });

        message.pending = false;
        await message.save();
      } else {
        message.pending = true;
        await message.save();
      }

      await Conversation.create({ ...data, messageId, name: u?.firstName + ' ' + u?.lastName, imgUrl: u?.image || '', from: data.from });

      const messages = admin
        ? await Messages.findByPk(messageId, {
          include: {
            model: Conversation,
            attributes: ['name', 'text', 'imgUrl', 'createdAt', 'from'],
          },
        })
        : await Messages.findAll({
          where: { email: message.email },
          include: {
            model: Conversation,
            attributes: ['name', 'text', 'imgUrl', 'createdAt', 'from'],
          },
        });
      return {
        text: 'Your message has been sended succesfully',
        messages,
      };
    } catch (error) {
      throw new HttpException('There was an error adding the message:' + error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
