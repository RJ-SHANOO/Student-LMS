export function ModuleIcon({
  mod,
  icon: Icon,
}: {
  mod: string;
  icon: (props: { className?: string }) => React.ReactElement;
}) {
  return (
    <span
      className="rounded-md p-2"
      style={{ backgroundColor: `var(--color-mod-${mod}-soft)`, color: `var(--color-mod-${mod})` }}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}
