import Link from "next/link";
import { Button } from "./ui/button";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";
// import { getUserProfile } from "@/utils/supabase/fetchData";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // const profile = user ? await getUserProfile(user.id) : null;

  return user ? (
    <div className="flex items-center gap-4">
      <Link href="/" className="flex items-center gap-2">
      <AvatarPrimitive.Root 
        className="inline-flex items-center justify-center align-middle overflow-hidden select-none w-11 h-11 rounded-full bg-black/30">
        <AvatarPrimitive.Image 
          src=""
          alt={user.email} 
          className="w-full h-full object-cover rounded-inherit"/>
        <AvatarPrimitive.Fallback 
          delayMs={1000}
          className="w-full h-full flex items-center justify-center bg-white text-violet-700 text-sm leading-none font-medium">
            A
          </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      </Link>
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
