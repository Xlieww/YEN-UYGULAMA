
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const USERS_STORAGE_KEY = "biztrack_users"; // Should be same as in signup

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (typeof window !== "undefined") {
      try {
        const existingUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
        const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];

        const foundUser = existingUsers.find(
          (user: { email: string; password?: string }) => // Allow password to be optional for safety if it wasn't stored
            user.email === data.email && user.password === data.password // In real app, compare hashed passwords
        );

        if (foundUser) {
          toast({
            title: "Giriş Başarılı",
            description: "Yönetim paneline yönlendiriliyorsunuz...",
          });
          // Store user info for UserNav or other components
          localStorage.setItem("biztrack_currentUser", JSON.stringify({ email: foundUser.email }));
          router.push("/dashboard");
        } else {
          toast({
            variant: "destructive",
            title: "Giriş Başarısız",
            description: "E-posta veya şifre hatalı.",
          });
          form.setError("password", { type: "manual", message: "E-posta veya şifre hatalı." });
        }
      } catch (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Giriş sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex items-center justify-center">
            <Gauge className="h-12 w-12 text-primary" />
            <span className="ml-2 text-3xl font-bold text-primary">BizTrack</span>
          </div>
          <CardTitle className="text-2xl">Personel Girişi</CardTitle>
          <CardDescription>Devam etmek için lütfen giriş yapın.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input placeholder="ornek@adres.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </Button>
              <Link href="/signup" passHref className="w-full">
                <Button variant="outline" className="w-full">
                  Yeni Hesap Oluştur
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
