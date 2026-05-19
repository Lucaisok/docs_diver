"use client";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { SiteContent } from "@/src/lib/content";
import { FormEvent, useState } from "react";
import styles from "./inputArea.module.css";

interface InputArea {
    cleanInputError: () => void;
    isDisabled: boolean;
    isLoading: boolean;
    send: (value: { text: string; }) => void;
}

export const InputArea = ({ cleanInputError, send, isDisabled, isLoading }: InputArea) => {
    const [input, setInput] = useState("");

    // Clear error when user starts typing
    const handleInputChange = (value: string) => {
        cleanInputError();
        setInput(value);
    };

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const value = input.trim();

        if (!value || isLoading || isDisabled) {
            return;
        }

        send({ text: value });
        setInput("");
    };
    return <form onSubmit={handleFormSubmit} className={styles.form}>
        <Input
            className={styles.input}
            value={input}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder={SiteContent.questionPlaceholder}
        />
        <Button type="submit" disabled={isLoading || isDisabled}>
            {SiteContent.ask}
        </Button>
    </form>;
};