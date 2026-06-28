import { useEffect, useState, type ReactNode } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  storageKey: string;
  expected: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function PasswordGate({ storageKey, expected, title, description, children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(storageKey) === "1") setUnlocked(true);
  }, [storageKey]);

  if (unlocked) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-2 text-xs text-success">
          <ShieldCheck className="h-3.5 w-3.5" />
          Sessão desbloqueada
          <button
            className="ml-auto text-muted-foreground hover:text-foreground underline"
            onClick={() => {
              sessionStorage.removeItem(storageKey);
              setUnlocked(false);
            }}
          >
            Bloquear
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pwd === expected) {
            sessionStorage.setItem(storageKey, "1");
            setUnlocked(true);
          } else {
            setErr(true);
          }
        }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
      >
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center mb-5"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Lock className="h-5 w-5 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Senha de acesso</label>
        <Input
          type="password"
          autoFocus
          value={pwd}
          onChange={(e) => {
            setPwd(e.target.value);
            setErr(false);
          }}
          className="mt-2 bg-input border-border"
          placeholder="Digite a senha"
        />
        {err && <p className="text-xs text-destructive mt-2">Senha incorreta</p>}
        <Button
          type="submit"
          className="w-full mt-5 text-primary-foreground border-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          Entrar
        </Button>
        <p className="text-[11px] text-muted-foreground text-center mt-4">
          Demo: a senha está no rodapé da sidebar.
        </p>
      </form>
    </div>
  );
}