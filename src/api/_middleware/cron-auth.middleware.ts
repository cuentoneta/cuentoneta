import { bearerAuth } from 'hono/bearer-auth';
import { timingSafeEqual } from 'hono/utils/buffer';
import { environment } from '../_helpers/environment';

// Exige `Authorization: Bearer <CRON_SECRET>`. Sin secreto configurado se rechaza todo: un entorno
// sin él nunca deja la escritura abierta.
export const cronAuth = bearerAuth({
	verifyToken: async (token) => {
		const secret = environment.cronSecret;
		return secret ? timingSafeEqual(token, secret) : false;
	},
});
