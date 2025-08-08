import pino from 'pino';

export const logger = pino({
	timestamp: pino.stdTimeFunctions.isoTime, // Enables precise ISO timestamps
	level: 'info',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			ignore: 'pid,hostname',
			translateTime: 'yyyy-mm-dd HH:MM:ss.l',
		},
	},
});
