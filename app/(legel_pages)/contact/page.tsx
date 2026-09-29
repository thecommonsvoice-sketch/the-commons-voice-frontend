"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

// ✅ Validation schema
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormSchema = z.infer<typeof schema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      category: "",
      message: "",
    },
  });

  const categoryValue = watch("category");

  const onSubmit = async (data: FormSchema) => {
    setIsSubmitting(true);
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          name: data.name,
          email: data.email,
          category: data.category,
          subject: data.subject,
          message: data.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      toast.success("Message sent successfully!");
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] text-[#1A1715] min-h-screen py-8 sm:py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Breadcrumb & Section Kicker */}
        <div className="border-b border-[#E2D9CE] pb-3 mb-6 text-xs font-sans text-[#68635D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#C2410C] font-bold uppercase text-[10px] tracking-wider">
              Editorial Communications
            </span>
            <span className="text-[#D1C4B5]">/</span>
            <span className="font-semibold text-[#1A1715]">Contact Desk</span>
          </div>
          <span className="font-mono text-[11px] text-[#68635D]">Official Newsroom Registry</span>
        </div>

        {/* Page Header with Double Rule */}
        <div className="border-b-[3px] border-[#1A1715] border-double pb-6 mb-8 text-center sm:text-left">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1715] tracking-tight">
            Contact The Commons Voice
          </h1>
          <p className="font-serif text-sm sm:text-base text-[#3C3835] max-w-3xl leading-relaxed mt-2">
            Have a confidential news tip, editorial inquiry, correction, or general feedback? Send a direct dispatch to our newsroom desk or reach our office directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Form (8 Cols) */}
          <div className="lg:col-span-8 bg-[#FAF7F2] border border-[#E2D9CE] p-6 sm:p-8">
            <div className="border-b border-[#E2D9CE] pb-3 mb-6 flex items-center justify-between">
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#1A1715] flex items-center gap-2">
                <Send className="h-4 w-4 text-[#C2410C]" />
                <span>Send a Dispatch to the Desk</span>
              </h2>
              <span className="font-sans text-[10px] uppercase font-bold text-[#68635D] tracking-wider">
                Direct Inquiry
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-[#1A1715]">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Jane Doe"
                    {...register("name")}
                    className={`rounded-none bg-[#F5EFEB] border-[#E2D9CE] text-xs text-[#1A1715] focus:border-[#1A1715] ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#1A1715]">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    {...register("email")}
                    className={`rounded-none bg-[#F5EFEB] border-[#E2D9CE] text-xs text-[#1A1715] focus:border-[#1A1715] ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-[#1A1715]">
                    Subject / Headline *
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of inquiry"
                    {...register("subject")}
                    className={`rounded-none bg-[#F5EFEB] border-[#E2D9CE] text-xs text-[#1A1715] focus:border-[#1A1715] ${
                      errors.subject ? "border-red-500" : ""
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-[11px] text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-[#1A1715]">
                    Department / Category *
                  </Label>
                  <Select
                    value={categoryValue}
                    onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
                  >
                    <SelectTrigger className={`rounded-none bg-[#F5EFEB] border-[#E2D9CE] text-xs text-[#1A1715] focus:border-[#1A1715] ${errors.category ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none bg-[#FAF7F2] border border-[#E2D9CE]">
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="story-tip">Confidential Story Tip</SelectItem>
                      <SelectItem value="feedback">Reader Feedback</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="partnership">Syndication &amp; Partnership</SelectItem>
                      <SelectItem value="press">Press Inquiries</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-[11px] text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-[#1A1715]">
                  Message / Details *
                </Label>
                <Textarea
                  id="message"
                  placeholder="Provide context, references, or message details..."
                  className={`min-h-32 rounded-none bg-[#F5EFEB] border-[#E2D9CE] text-xs text-[#1A1715] focus:border-[#1A1715] ${errors.message ? "border-red-500" : ""}`}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-[11px] text-red-600">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1A1715] hover:bg-[#C2410C] text-[#FAF7F2] font-sans font-bold uppercase tracking-widest text-xs py-2.5 transition-colors rounded-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Transmitting..." : "Send Message to Editorial Desk"}
              </Button>
            </form>
          </div>

          {/* Contact Details & Office Registry (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Primary Registry Box */}
            <div className="bg-[#F4EFEA] border border-[#DFD6C9] p-6 space-y-5">
              <div className="border-b border-[#D1C4B5] pb-2">
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#C2410C] block">
                  Official Communication
                </span>
                <h3 className="font-headline text-xl font-bold text-[#1A1715]">
                  Direct Contacts
                </h3>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#EAE2D7] border border-[#D1C4B5] shrink-0 text-[#1A1715]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1A1715] uppercase tracking-wider text-[11px] block">
                      General &amp; Editorial Desk
                    </span>
                    <a
                      href="mailto:contact@thecommonsvoice.com"
                      className="text-[#C2410C] hover:underline font-semibold font-mono text-xs block mt-0.5"
                    >
                      contact@thecommonsvoice.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#EAE2D7] border border-[#D1C4B5] shrink-0 text-[#1A1715]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1A1715] uppercase tracking-wider text-[11px] block">
                      Registered Office
                    </span>
                    <p className="font-serif text-xs text-[#3C3835] leading-relaxed mt-0.5">
                      86, Ln 1, Rajeshwar Nagar Phase-I,<br />
                      Aman Vihar, Dehradun,<br />
                      Uttarakhand 248013, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Confidentiality Notice */}
            <div className="bg-[#FAF7F2] border border-[#E2D9CE] p-5 space-y-2">
              <h4 className="font-sans text-[11px] uppercase font-bold tracking-wider text-[#1A1715]">
                Source Protection
              </h4>
              <p className="font-serif text-xs text-[#68635D] leading-relaxed">
                The Commons Voice adheres to strict journalistic protocols concerning source confidentiality and whistleblower integrity. Confidential leads may also be directed securely to our editorial leads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
