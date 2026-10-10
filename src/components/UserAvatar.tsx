import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const SIZES = { xs: "size-6 text-[10px]", sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-12 text-base", xl: "size-24 text-2xl sm:size-32 sm:text-3xl" };

export default function UserAvatar({
  user,
  size = "md",
  className,
}: {
  user: { name: string | null; username: string; image: string | null };
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const initial = (user.name?.trim() || user.username || "?")[0]?.toUpperCase();
  return (
    <Avatar className={cn(SIZES[size], className)}>
      {user.image ? <AvatarImage src={user.image} alt="" className="object-cover" /> : null}
      <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">{initial}</AvatarFallback>
    </Avatar>
  );
}
