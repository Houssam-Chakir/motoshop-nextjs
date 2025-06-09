'use client'

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
  maxWidth = "max-w-[1440px]",
  paddingX = "px-4 sm:px-6 lg:px-8",
}) => {
  return <div className={`w-full ${maxWidth} mx-auto ${paddingX} ${className}`}>{children}</div>;
};

export default Container;
