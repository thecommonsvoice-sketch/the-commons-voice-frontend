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
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormSchema) => {
    setIsSubmitting(true);
    console.log(data);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Message sent successfully! We&rsquo;ll get back to you soon.");
      reset();
    } catch (err) {
      console.error("Contact form error:", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
      <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Contact Us</h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
          Have a story tip, feedback, or question? We&rsquo;d love to hear from you. Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                Send us a message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      {...register("name")}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What&apos;s this about?"
                      {...register("subject")}
                      className={errors.subject ? "border-red-500" : ""}
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => setValue("category", value)}>
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="story-tip">Story Tip</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="press">Press Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    className={`min-h-24 sm:min-h-32 ${errors.message ? "border-red-500" : ""}`}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-start sm:items-center space-x-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1 sm:mt-0 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Email</p>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">contact@thecommonvoice.com</p>
                </div>
              </div>

              <div className="flex items-start sm:items-center space-x-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1 sm:mt-0 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Phone</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Address</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    123 News Avenue<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Newsroom</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div>
                <p className="font-medium text-sm sm:text-base">Editorial</p>
                <p className="text-xs sm:text-sm text-muted-foreground break-all">editorial@thecommonvoice.com</p>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Tips &amp; Leads</p>
                <p className="text-xs sm:text-sm text-muted-foreground break-all">tips@thecommonvoice.com</p>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Press Inquiries</p>
                <p className="text-xs sm:text-sm text-muted-foreground break-all">press@thecommonvoice.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
