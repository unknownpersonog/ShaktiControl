import React from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  className = "",
}) => {
  const [error, setError] = React.useState(false);

  const handleError = () => setError(true);

  const baseStyles =
    "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full";
  const combinedClassName = `${baseStyles} ${className}`;

  if (error || !src) {
    return (
      <div className={combinedClassName}>
        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className={combinedClassName}>
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        onError={handleError}
      />
    </div>
  );
};

export default Avatar;
