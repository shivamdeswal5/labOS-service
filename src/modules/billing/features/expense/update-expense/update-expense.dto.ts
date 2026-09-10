import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { ExpenseCategoryEnum } from 'src/modules/billing/domain/expense/enums/expense-category.enum';
import { PaymentMethodEnum } from 'src/modules/billing/domain/invoice/enums/payment-method.enum';

export class UpdateExpenseDto {
  @IsOptional()
  @IsEnum(ExpenseCategoryEnum)
  category?: ExpenseCategoryEnum;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  paymentMethod?: PaymentMethodEnum;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  vendorInvoiceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
