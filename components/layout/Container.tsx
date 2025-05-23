import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  paddingX?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  maxWidth = "max-w-[1440px]", // Default max-width (1280px in standard Tailwind)
  paddingX = "px-4 sm:px-6 lg:px-8",
}) => {
  return <div className={`w-full ${maxWidth} mx-auto ${paddingX} ${className}`}>{children}</div>;
};

export default Container;
