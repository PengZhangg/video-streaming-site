import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css"

export default function Navbar() {
    return (
        <nav className={styles.nav}>
            <Link href="/">
                <Image src="/logo.svg" alt="Logo" width={120} height={120} />
            </Link>
        </nav>
    )
}