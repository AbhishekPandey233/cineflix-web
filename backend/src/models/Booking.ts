import mongoose, { Document, Schema } from "mongoose";

export type BookingStatus = "confirmed" | "cancelled";

export interface IBooking extends Document {
	userId?: mongoose.Types.ObjectId;
	showtimeId: mongoose.Types.ObjectId;
	seats: string[];
	totalPrice: number;
	status: BookingStatus;
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
	},
	{
		timestamps: true,
	}
);

BookingSchema.index({ showtimeId: 1, status: 1 });

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);
