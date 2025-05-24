
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, saveLeaveRequestToStorage } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const leaveRequestFormSchema = z.object({
  startDate: z.date({
    required_error: "Başlangıç tarihi zorunludur.",
  }),
  endDate: z.date({
    required_error: "Bitiş tarihi zorunludur.",
  }),
  reason: z.string().min(10, {
    message: "İzin sebebi en az 10 karakter olmalıdır.",
  }).max(500, {
    message: "İzin sebebi en fazla 500 karakter olabilir."
  }),
}).refine(data => data.endDate >= data.startDate, {
  message: "Bitiş tarihi, başlangıç tarihinden önce veya aynı olamaz.",
  path: ["endDate"],
});

type LeaveRequestFormValues = z.infer<typeof leaveRequestFormSchema>;

export default function LeaveRequestPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: addDays(new Date(),1),
      reason: "",
    },
  });

  const onSubmit = async (data: LeaveRequestFormValues) => {
    setIsLoading(true);
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İzin talebi göndermek için giriş yapmalısınız.",
      });
      setIsLoading(false);
      router.push("/login");
      return;
    }

    try {
      saveLeaveRequestToStorage({
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
        reason: data.reason,
      });
      toast({
        title: "İzin Talebi Gönderildi",
        description: "İzin talebiniz başarıyla yöneticiye iletilmiştir.",
      });
      form.reset();
      // Optionally redirect or update UI
    } catch (error) {
      console.error("Leave request submission error:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "İzin talebi gönderilirken bir sorun oluştu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>İzin Talebi Oluştur</CardTitle>
        <CardDescription>
          Aşağıdaki formu doldurarak izin talebinde bulunabilirsiniz. Talebiniz yönetici onayına sunulacaktır.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>İzin Başlangıç Tarihi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: tr })
                            ) : (
                              <span>Bir tarih seçin</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < addDays(new Date(), -1) // Prevent selecting past dates
                          }
                          initialFocus
                          locale={tr}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>İzin Bitiş Tarihi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: tr })
                            ) : (
                              <span>Bir tarih seçin</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                             date < (form.getValues("startDate") || new Date())
                          }
                          initialFocus
                          locale={tr}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İzin Sebebi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Lütfen izin talebinizin sebebini detaylı bir şekilde açıklayın..."
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? "Gönderiliyor..." : <><Send className="mr-2 h-4 w-4" /> Talep Gönder</>}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
