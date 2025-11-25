import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarWrapperProps {
  src: string;
  alt: string;
  fallback: string;
}

export default function AvatarWrapper({
  src,
  alt,
  fallback,
}: AvatarWrapperProps) {
  return (
    <Avatar className="border border-solid border-white">
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
