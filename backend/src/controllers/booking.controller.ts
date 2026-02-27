import { Request, Response } from "express";
import { BookingModel } from "../models/Booking";
import { HallId, ShowtimeModel } from "../models/Showtime";
import { FRONTEND_URL, KHALTI_BASE_URL, KHALTI_SECRET_KEY } from "../config";

type HallLayout = {
	hallId: HallId;
	hallName: string;
	rows: string[];
	seatsPerRow: number;
};

const HALL_LAYOUTS: Record<HallId, HallLayout> = {
	A: {
		hallId: "A",
		hallName: "Hall A",
		rows: ["A", "B", "C", "D", "E", "F"],
		seatsPerRow: 10,
	},
	B: {
		hallId: "B",
		hallName: "Hall B",
		rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
		seatsPerRow: 12,
	},
};

const buildSeatIds = (layout: HallLayout) => {
	const seats: string[] = [];
	for (const row of layout.rows) {
		for (let i = 1; i <= layout.seatsPerRow; i += 1) {
			seats.push(`${row}${i}`);
		}
	}
	return seats;
};

const callKhaltiApi = async <T>(path: string, payload: Record<string, unknown>): Promise<T> => {
	const response = await fetch(`${KHALTI_BASE_URL}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Key ${KHALTI_SECRET_KEY}`,
		},
		body: JSON.stringify(payload),
	});

	const data = (await response.json()) as T & { detail?: string };

	if (!response.ok) {
		throw new Error((data as { detail?: string }).detail || "Khalti request failed");
	}

	return data;
};

export class BookingController {
	async getShowtimesByMovie(req: Request, res: Response) {
		try {
			const movieId = String(req.params.movieId);

			const showtimes = await ShowtimeModel.find({ movieId })
				.sort({ startTime: 1 })
				.lean();

			return res.status(200).json({
				success: true,
				data: showtimes,
			});
		} catch (error: any) {
			return res.status(error.statusCode ?? 500).json({
				success: false,
				message: error.message || "Internal Server Error",
			});
		}
	}

	async getSeatAvailability(req: Request, res: Response) {
		try {
			const showtimeId = String(req.params.showtimeId);

			const showtime = await ShowtimeModel.findById(showtimeId).lean();
			if (!showtime) {
				return res.status(404).json({ success: false, message: "Showtime not found" });
			}

			const layout = HALL_LAYOUTS[showtime.hallId as HallId];
			const seatIds = buildSeatIds(layout);

			const booked = await BookingModel.find({ showtimeId, status: "confirmed" })
				.select("seats -_id")
				.lean();

			const bookedSeats = booked.flatMap((b) => b.seats);

			return res.status(200).json({
				success: true,
				data: {
					showtimeId,
					movieId: showtime.movieId,
					hallId: showtime.hallId,
					hallName: showtime.hallName,
					startTime: showtime.startTime,
					price: showtime.price,
					layout: {
						rows: layout.rows,
						seatsPerRow: layout.seatsPerRow,
						seatIds,
					},
					bookedSeats,
				},
			});
		} catch (error: any) {
			return res.status(error.statusCode ?? 500).json({
				success: false,
				message: error.message || "Internal Server Error",
			});
		}
	}

	async createBooking(req: Request, res: Response) {
		try {
			const { showtimeId, seats } = req.body as { showtimeId?: string; seats?: string[] };

			if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
				return res.status(400).json({
					success: false,
					message: "showtimeId and seats are required",
				});
			}

			const showtime = await ShowtimeModel.findById(showtimeId).lean();
			if (!showtime) {
				return res.status(404).json({ success: false, message: "Showtime not found" });
			}

			const layout = HALL_LAYOUTS[showtime.hallId as HallId];
			const validSeats = new Set(buildSeatIds(layout));

			const normalizedSeats = Array.from(new Set(seats.map((s) => String(s).toUpperCase())));
			const invalidSeats = normalizedSeats.filter((s) => !validSeats.has(s));

			if (invalidSeats.length > 0) {
				return res.status(400).json({
					success: false,
					message: "Invalid seats selected",
					data: { invalidSeats },
				});
			}

			const conflict = await BookingModel.findOne({
				showtimeId,
				status: "confirmed",
				seats: { $in: normalizedSeats },
			})
				.select("seats")
				.lean();

			if (conflict) {
				return res.status(409).json({
					success: false,
					message: "Some seats are already booked",
					data: { unavailableSeats: conflict.seats },
				});
			}

			const price = showtime.price || 0;
			const totalPrice = normalizedSeats.length * price;

			const booking = await BookingModel.create({
				userId: (req as any).user?.id,
				showtimeId,
				seats: normalizedSeats,
				totalPrice,
				status: "confirmed",
			});

			return res.status(201).json({
				success: true,
				message: "Booking created",
				data: booking,
			});
		} catch (error: any) {
			return res.status(error.statusCode ?? 500).json({
				success: false,
				message: error.message || "Internal Server Error",
			});
		}
	}

	async getUserBookings(req: Request, res: Response) {
		try {
			const userId = (req as any).user?.id;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const bookings = await BookingModel.find({ userId, status: "confirmed" })
				.populate({
					path: "showtimeId",
					populate: {
						path: "movieId",
						select: "title"
					}
				})
				.sort({ createdAt: -1 })
				.lean();

			return res.status(200).json({
				success: true,
				data: bookings,
			});
		} catch (error: any) {
			return res.status(error.statusCode ?? 500).json({
				success: false,
				message: error.message || "Internal Server Error",
			});
		}
	}

	async cancelBooking(req: Request, res: Response) {
		try {
			const userId = (req as any).user?.id;
			const bookingId = String(req.params.bookingId);

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const booking = await BookingModel.findOne({
				_id: bookingId,
				userId,
				status: "confirmed",
			});

			if (!booking) {
				return res.status(404).json({
					success: false,
					message: "Booking not found or already cancelled",
				});
			}

			booking.status = "cancelled";
			booking.canceledBy = "user";
			await booking.save();

			return res.status(200).json({
				success: true,
				message: "Booking cancelled successfully",
				data: booking,
			});
		} catch (error: any) {
			return res.status(error.statusCode ?? 500).json({
				success: false,
				message: error.message || "Internal Server Error",
			});
		}
	}

	async initiateKhaltiPayment(req: Request, res: Response) {
		try {
			if (!KHALTI_SECRET_KEY) {
				return res.status(500).json({
					success: false,
					message: "Khalti is not configured. Missing KHALTI_SECRET_KEY",
				});
			}

			const authUser = (req as any).user as {
				id?: string;
				email?: string;
				name?: string;
				firstName?: string;
				lastName?: string;
			};
			const userId = authUser?.id;
			const bookingId = String(req.params.bookingId);

			if (!userId) {
				return res.status(401).json({ success: false, message: "Unauthorized" });
			}

			const booking = await BookingModel.findOne({
				_id: bookingId,
				userId,
				status: "confirmed",
			}).populate({
				path: "showtimeId",
				populate: {
					path: "movieId",
					select: "title",
				},
			});

			if (!booking) {
				return res.status(404).json({
					success: false,
					message: "Booking not found",
				});
			}

			if (booking.paymentStatus === "paid") {
				return res.status(400).json({
					success: false,
					message: "Booking is already paid",
				});
			}

			const amountInPaisa = Math.round(Number(booking.totalPrice || 0) * 100);
			if (amountInPaisa <= 0) {
				return res.status(400).json({
					success: false,
					message: "Invalid booking amount",
				});
			}

			const movieTitle =
				(booking.showtimeId as any)?.movieId?.title ||
				"CineFlix Ticket";

			const customerName =
				[authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ") ||
				authUser?.name ||
				"CineFlix User";

			const returnUrl = `${FRONTEND_URL}/history?bookingId=${booking._id}`;

			const khaltiResponse = await callKhaltiApi<{
				pidx: string;
				payment_url: string;
			}>('/api/v2/epayment/initiate/', {
				return_url: returnUrl,
				website_url: FRONTEND_URL,
				amount: amountInPaisa,
				purchase_order_id: String(booking._id),
				purchase_order_name: `${movieTitle} Ticket`,
				customer_info: {
					name: customerName,
					email: authUser?.email || "",
				},
			});

			booking.paymentStatus = "pending";
			booking.paymentProvider = "khalti";
			booking.khaltiPidx = khaltiResponse.pidx;
			await booking.save();

			return res.status(200).json({
				success: true,
				data: {
					paymentUrl: khaltiResponse.payment_url,
					pidx: khaltiResponse.pidx,
				},
			});
		} catch (error: any) {
			return res.status(error.statusCode ?? 500).json({
				success: false,
				message: error.message || "Internal Server Error",
			});
		}
	}

	async verifyKhaltiPayment(req: Request, res: Response) {
		try {
			if (!KHALTI_SECRET_KEY) {
				return res.status(500).json({
					success: false,
					message: "Khalti is not configured. Missing KHALTI_SECRET_KEY",
				});
			}

			const userId = (req as any).user?.id;
			const bookingId = String(req.params.bookingId);
			const { pidx } = req.body as { pidx?: string };

			if (!userId) {
				return res.status(401).json({ success: false, message: "Unauthorized" });
			}

			if (!pidx) {
				return res.status(400).json({
					success: false,
					message: "pidx is required",
				});
			}

			const booking = await BookingModel.findOne({
				_id: bookingId,
				userId,
				status: "confirmed",
			});

			if (!booking) {
				return res.status(404).json({
					success: false,
					message: "Booking not found",
				});
			}

			if (booking.khaltiPidx && booking.khaltiPidx !== pidx) {
				return res.status(400).json({
					success: false,
					message: "Invalid payment reference for this booking",
				});
			}

			const lookupResponse = await callKhaltiApi<{
				status: string;
				transaction_id?: string;
			}>('/api/v2/epayment/lookup/', { pidx });

			if (lookupResponse.status === "Completed") {
				booking.paymentStatus = "paid";
				booking.paymentProvider = "khalti";
				booking.khaltiPidx = pidx;
				booking.paidAt = new Date();
				await booking.save();

				return res.status(200).json({
					success: true,
					message: "Payment verified successfully",
					data: {
						bookingId: booking._id,
						paymentStatus: booking.paymentStatus,
						provider: booking.paymentProvider,
					},
				});
			}

			booking.paymentStatus = "unpaid";
			await booking.save();

			return res.status(400).json({
				success: false,
				message: `Payment not completed. Current status: ${lookupResponse.status}`,
				data: {
					bookingId: booking._id,
					paymentStatus: booking.paymentStatus,
				},
			});
		} catch (error: any) {
			return res.status(error.statusCode ?? 500).json({
				success: false,
				message: error.message || "Internal Server Error",
			});
		}
	}

	async adminGetAllBookings(req: Request, res: Response) {
		try {
			const bookings = await BookingModel.find()
				.populate({
					path: "showtimeId",
					populate: {
						path: "movieId",
						select: "title"
					}
				})
				.populate("userId", "email fullName")
				.sort({ createdAt: -1 })
				.lean();

			return res.status(200).json({
				success: true,
				data: bookings,
			});
		} catch (error: any) {
			return res.status(error.statusCode ?? 500).json({
				success: false,
				message: error.message || "Internal Server Error",
			});
		}
	}

	async adminCancelBooking(req: Request, res: Response) {
		try {
			const bookingId = String(req.params.bookingId);

			const booking = await BookingModel.findById(bookingId);

			if (!booking) {
				return res.status(404).json({
					success: false,
					message: "Booking not found",
				});
			}

			if (booking.status === "cancelled") {
				return res.status(400).json({
					success: false,
					message: "Booking is already cancelled",
				});
			}

			booking.status = "cancelled";
			booking.canceledBy = "admin";
			await booking.save();

			return res.status(200).json({
				success: true,
				message: "Booking cancelled successfully",
				data: booking,
			});
		} catch (error: any) {
			return res.status(error.statusCode ?? 500).json({
				success: false,
				message: error.message || "Internal Server Error",
			});
		}
	}

	async adminRemoveCancelledBooking(req: Request, res: Response) {
		try {
			const bookingId = String(req.params.bookingId);

			const booking = await BookingModel.findById(bookingId);

			if (!booking) {
				return res.status(404).json({
					success: false,
					message: "Booking not found",
				});
			}

			if (booking.status !== "cancelled") {
				return res.status(400).json({
					success: false,
					message: "Only cancelled bookings can be removed",
				});
			}

			await BookingModel.findByIdAndDelete(bookingId);

			return res.status(200).json({
				success: true,
				message: "Cancelled booking removed",
			});
		} catch (error: any) {
			return res.status(error.statusCode ?? 500).json({
				success: false,
				message: error.message || "Internal Server Error",
			});
		}
	}
}
