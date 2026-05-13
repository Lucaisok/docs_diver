import styles from "./Input.module.css";
import { joinClasses } from "@/src/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export const Input = ({ className, ...props }: InputProps) => {
    return <input className={joinClasses(styles.input, className)} {...props} />;
};

export default Input;
