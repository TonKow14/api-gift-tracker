import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';

@Injectable()
export class RequestLogGuard implements CanActivate {
    constructor(private reflector: Reflector,
        private readonly connection: DataSource) { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        // console.log(request.headers)
        // console.log(request.useragent);

        const { password, ...bodyWithOutPassword } = request.body || {}

        // const requestLog = this.connection.getRepository(RequestLog).create({
        //     id_user: request.user?.id_employee,
        //     platform: request.useragent?.browser || request.useragent?.platform || request.useragent?.os || request.headers['sec-ch-ua-platform'],
        //     protocol: request.headers?.origin?.split(':')[0] || request.protocol,
        //     ip: request.headers['x-forwarded-for']?.split(':')[0],
        //     method: request.method,
        //     url: request.url.split('?')[0],
        //     query: JSON.stringify(request.query),
        //     body: JSON.stringify(bodyWithOutPassword),
        // })

        // await this.connection.getRepository(RequestLog).insert(requestLog)

        return true;
    }
}