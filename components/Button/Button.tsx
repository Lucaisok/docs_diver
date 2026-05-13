import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "tertiary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
}

export const Button = ({
    variant = "primary",
    className,
    children,
    ...props
}: ButtonProps) => {
    return (
        <button
            className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
