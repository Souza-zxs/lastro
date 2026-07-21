import { UploadCloud, Fingerprint, FileText, QrCode, KeyRound } from "lucide-react";
import { SealMark } from "@/components/SealMark";
import { cn } from "@/lib/utils";

interface NoBadgeProps {
  icon?: React.ReactNode;
  className?: string;
}

function NoBadge({ icon, className }: NoBadgeProps) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full bg-seal text-paper",
        className
      )}
    >
      {icon}
    </span>
  );
}

function No({
  x,
  y,
  w,
  h,
  titulo,
  badge,
  variant = "default",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  titulo: string;
  badge?: React.ReactNode;
  variant?: "hub" | "default" | "leaf";
}) {
  return (
    <foreignObject x={x} y={y} width={w} height={h}>
      <div
        className={cn(
          "flex h-full w-full items-center gap-2.5 rounded-sm border px-3.5 text-left",
          variant === "hub" && "hub-pulse border-ledger bg-ledger text-paper",
          variant === "default" && "border-line bg-paper-certificate text-ink shadow-sm",
          variant === "leaf" && "border-dashed border-line/80 bg-transparent text-ink-muted"
        )}
      >
        {badge}
        <span className={cn("text-sm leading-snug", variant === "leaf" ? "text-xs" : "font-medium")}>
          {titulo}
        </span>
      </div>
    </foreignObject>
  );
}

const FAN_PATHS = [
  "M650,94 C650,140 285,150 285,190",
  "M650,94 L650,190",
  "M650,94 C650,140 1015,150 1015,190",
];

export function ComoFuncionaDiagram({ className }: { className?: string }) {
  const iconCls = "size-3.5";

  return (
    <svg
      viewBox="0 0 1300 420"
      className={cn("w-full overflow-visible", className)}
      role="img"
      aria-label="Diagrama: sua imagem passa por hash e carimbo de tempo, gera um certificado e fica disponível para verificação pública."
    >
      <defs>
        <filter id="pulse-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* dotted fan-out from hub — energy flowing out of "Sua imagem" */}
      <g fill="none" stroke="var(--ledger)" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="1.5 5" strokeLinecap="round">
        {FAN_PATHS.map((d) => (
          <path key={d} d={d} className="flow-line" />
        ))}
      </g>
      {FAN_PATHS.map((d, i) => (
        <circle
          key={d}
          r="3.5"
          fill="var(--seal)"
          filter="url(#pulse-glow)"
          className="pulse-dot"
          style={{
            offsetPath: `path('${d}')`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      {/* solid connectors branch -> leaf */}
      <g fill="none" stroke="var(--line)" strokeWidth="1.5">
        <path d="M285,254 L285,330" />
        <path d="M650,254 L650,330" />
        <path d="M1015,254 L1015,330" />
      </g>

      {/* solid flank connectors */}
      <g fill="none" stroke="var(--line)" strokeWidth="1.5">
        <path d="M170,222 L180,222" />
        <path d="M1120,222 L1130,222" />
      </g>

      <No
        x={550}
        y={30}
        w={200}
        h={64}
        titulo="Sua imagem"
        variant="hub"
        badge={<SealMark size={26} className="shrink-0 text-paper" />}
      />

      <No
        x={0}
        y={190}
        w={170}
        h={64}
        titulo="Enviada pelo navegador"
        badge={<NoBadge icon={<UploadCloud className={iconCls} />} />}
      />
      <No
        x={180}
        y={190}
        w={210}
        h={64}
        titulo="Hash + carimbo de tempo"
        badge={<NoBadge icon={<Fingerprint className={iconCls} />} />}
      />
      <No
        x={545}
        y={190}
        w={210}
        h={64}
        titulo="Certificado gerado"
        badge={<NoBadge icon={<FileText className={iconCls} />} />}
      />
      <No
        x={910}
        y={190}
        w={210}
        h={64}
        titulo="Verificação pública"
        badge={<NoBadge icon={<QrCode className={iconCls} />} />}
      />
      <No
        x={1130}
        y={190}
        w={170}
        h={64}
        titulo="Código de verificação único"
        badge={<NoBadge icon={<KeyRound className={iconCls} />} />}
      />

      <No x={180} y={330} w={210} h={56} titulo="Prova de que a obra já existia nessa data" variant="leaf" />
      <No x={545} y={330} w={210} h={56} titulo="PDF com seus dados e o hash" variant="leaf" />
      <No x={910} y={330} w={210} h={56} titulo="Qualquer pessoa confere, sem login" variant="leaf" />
    </svg>
  );
}
