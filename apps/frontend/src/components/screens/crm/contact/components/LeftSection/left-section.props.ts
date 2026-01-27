import { DetailedHTMLProps, HTMLAttributes } from 'react';

export type LeftSectionProps = {
  isLoading?: boolean;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
