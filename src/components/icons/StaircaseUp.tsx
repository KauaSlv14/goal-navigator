import { LucideProps } from 'lucide-react';

export const StaircaseUp = (props: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        {...props}
    >
        {/* Bar 1: Shortened slightly and lowered */}
        <rect x="3" y="17" width="3" height="4" rx="0.5" />
        {/* Bar 2: Shortened slightly and lowered */}
        <rect x="8" y="13" width="3" height="8" rx="0.5" />
        {/* Bar 3: Shortened slightly and lowered */}
        <rect x="13" y="10" width="3" height="11" rx="0.5" />
        {/* Bar 4: Shortened slightly and lowered */}
        <rect x="18" y="7" width="3" height="14" rx="0.5" />

        {/* Arrow: Lifted significantly higher with a steeper curve */}
        {/* Start point moved up from y=15 to y=11 */}
        {/* End point stays high at y=1 */}
        <path d="M2.5 12 C 9 8, 16 4, 19 1 L 17 1 L 23 0 L 23 6 L 21 6 L 21 4 C 13 8, 5 13, 4.5 13.5 Z" />
    </svg>
);
