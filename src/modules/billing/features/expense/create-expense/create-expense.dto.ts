import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { ExpenseCategoryEnum } from 'src/modules/billing/domain/expense/enums/expense-category.enum';
import { PaymentMethodEnum } from 'src/modules/billing/domain/invoice/enums/payment-method.enum';

export class CreateExpenseDto {
  @IsEnum(ExpenseCategoryEnum)
  category: ExpenseCategoryEnum;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0.01, { message: 'Expense amount must be greater than 0' })
  amount: number;

  @IsDateString()
  expenseDate: string;

  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;

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
