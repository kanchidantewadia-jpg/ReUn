import { z } from 'zod';

export const reportSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  age: z.number().int().min(0).max(150).optional(),
  gender: z.string().max(50).optional(),
  height: z.string().max(50).optional(),
  weight: z.string().max(50).optional(),
  last_seen_location: z.string().trim().min(1, "Last seen location is required").max(500),
  last_seen_date: z.string().min(1, "Last seen date is required"),
  clothing_description: z.string().max(1000).optional(),
  distinguishing_features: z.string().max(1000).optional(),
  additional_info: z.string().max(5000).optional(),
  contact_name: z.string().trim().min(1, "Contact name is required").max(100),
  contact_phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").max(20),
  contact_email: z.string().trim().email("Invalid email address").max(255).optional(),
});

export const messageSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(5000, "Message must be less than 5000 characters"),
});

export const cctvUploadSchema = z.object({
  location: z.string().trim().max(500).optional(),
  description: z.string().trim().max(1000).optional(),
  recorded_at: z.string().optional(),
});

export const feedbackSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  type: z.enum(['suggestion', 'bug', 'compliment', 'complaint', 'feature', 'other'], {
    errorMap: () => ({ message: "Please select a feedback type" })
  }),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Feedback is required").max(5000, "Feedback must be less than 5000 characters"),
  suggestions: z.string().max(2000, "Suggestions must be less than 2000 characters").optional(),
});

export const validateFile = (file: File, maxSize: number, allowedTypes: string[]) => {
  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
  }
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
};
