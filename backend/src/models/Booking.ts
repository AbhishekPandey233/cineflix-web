import mongoose, { Document, Schema } from "mongoose";

export type BookingStatus = "confirmed" | "cancelled";
export type CanceledBy = "user" | "admin";
export type PaymentStatus = "unpaid" | "pending" | "paid";
export type PaymentProvider = "khalti";

export interface IBooking extends Document {
	userId?: mongoose.Types.ObjectId;
	showtimeId: mongoose.Types.ObjectId;
	seats: string[];
	totalPrice: number;
	status: BookingStatus;
	canceledBy?: CanceledBy;
	paymentStatus: PaymentStatus;
	paymentProvider?: PaymentProvider;
	khaltiPidx?: string;
	paidAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const BookingSchema: Schema = new Schema<IBooking>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User" },
		showtimeId: { type: Schema.Types.ObjectId, ref: "Showtime", required: true, index: true },
		seats: { type: [String], required: true },
		totalPrice: { type: Number, default: 0 },
		status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
		canceledBy: { type: String, enum: ["user", "admin"], default: undefined },
		paymentStatus: { type: String, enum: ["unpaid", "pending", "paid"], default: "unpaid" },
		paymentProvider: { type: String, enum: ["khalti"], default: undefined },
		khaltiPidx: { type: String, default: undefined },
		paidAt: { type: Date, default: undefined },
	},
	{
		timestamps: true,
	}
);

BookingSchema.index({ showtimeId: 1, status: 1 });

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);
