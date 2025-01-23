import { Type, applyDecorators } from "@nestjs/common";
import { ApiBadRequestResponse, ApiExtraModels, ApiNotFoundResponse, ApiOkResponse, ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { getReasonPhrase } from 'http-status-codes';
import { Column, ColumnOptions } from "typeorm";

export class BaseResponseDto<T> {
    @ApiProperty({ description: 'สำเร็จ', default: true })
    success: boolean;

    @ApiProperty({ description: 'รหัสสถานะ', default: 200 })
    statusCode: number;

    @ApiProperty({ description: 'คำอธิบาย', default: 'สำเร็จ' })
    message: string;

    @ApiProperty({ description: 'ผลลัพท์' })
    data: T;
}

const responseSuccess = (
    data?: any,
    message?: string,
    code?: number,
): BaseResponseDto<any> => {
    const response = new BaseResponseDto();
    response.success = true;
    response.statusCode = code || 200;
    response.message = message || getReasonPhrase(response.statusCode);
    response.data = data;
    return response;
};

export { responseSuccess };

export const ApiOkResponseGeneric = <DataDto extends Type<unknown>>(option: { description: string, type: DataDto, isArray?: boolean; }) =>
    applyDecorators(
        ApiExtraModels(BaseResponseDto, option.type),
        ApiOkResponse({
            description: option.description,
            schema: {
                allOf: [
                    { $ref: getSchemaPath(BaseResponseDto) },
                    {
                        properties: {
                            data: option.isArray ? { type: 'array', items: { $ref: getSchemaPath(option.type) } } :
                                option.type.name == 'Boolean' ? { type: 'boolean', default: true } : { $ref: getSchemaPath(option.type) },
                        },
                    },
                ],
            },
        })
    );

export const ApiBadRequestResponseGeneric = <DataDto extends Type<unknown>>(option: { description: string, type: DataDto; }) =>
    applyDecorators(
        ApiExtraModels(BaseResponseDto, option.type),
        ApiBadRequestResponse({
            description: option.description,
            schema: {
                allOf: [
                    { $ref: getSchemaPath(option.type || BaseResponseDto) },
                    {
                        properties: {
                            success: { description: 'ล้มเหลว', default: false },
                            statusCode: { description: 'รหัสสถานะ', default: 400 },
                            description: { description: 'คำอธิบาย', default: option.description },
                            data: option.type.name == 'BaseResponseDto' ? { default: null } : { $ref: getSchemaPath(option.type) },
                        },
                    },
                ],
            },
        })
    );

export const ApiNotFoundResponseGeneric = <DataDto extends Type<unknown>>(option: { description: string, type: DataDto; }) =>
    applyDecorators(
        ApiExtraModels(BaseResponseDto, option.type),
        ApiNotFoundResponse({
            description: option.description,
            schema: {
                allOf: [
                    { $ref: getSchemaPath(option.type || BaseResponseDto) },
                    {
                        properties: {
                            success: { description: 'ล้มเหลว', default: false },
                            statusCode: { description: 'รหัสสถานะ', default: 404 },
                            description: { description: 'คำอธิบาย', default: option.description },
                            data: option.type.name == 'BaseResponseDto' ? { default: null } : { $ref: getSchemaPath(option.type) },
                        },
                    },
                ],
            },
        })
    );