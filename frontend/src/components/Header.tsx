import type { JSX } from "react";

interface HeaderProps{
    title:string
    styles:Record<string,string>;
}

export const Header =({title,styles}:HeaderProps): JSX.Element => {
return(
    
          <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
      </header>
)
}