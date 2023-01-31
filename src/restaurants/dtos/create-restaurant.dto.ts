import { ArgsType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { IsBoolean, Length } from 'class-validator';

@ArgsType()
export class CreateRestaurantDto {
  @Field((type) => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Field((type) => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field((type) => String)
  @IsString()
  address: string;

  @Field((type) => String)
  @IsString()
  ownerName: string;

  @Field((type) => String)
  @IsString()
  categoryName: string;
}
