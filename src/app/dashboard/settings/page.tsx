import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/db";
import {
  updateSiteSettingsAction,
  updateProfileAction,
  updateAdSettingsAction,
} from "@/lib/actions";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const settings = await getSiteSettings(user.id);

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-dark">
          Customize your blog at{" "}
          <Link href={`/p/${user.username}`} className="font-mono text-accent hover:underline">{user.username}.kotha.blog</Link>
        </p>
      </div>

      {/* Profile */}
      <section className="card-flat p-5 sm:p-6 animate-fade-in animate-delay-100">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Profile</h2>
        <form action={updateProfileAction} className="space-y-4">
          <div>
            <label className="input-label">Display Name</label>
            <input name="displayName" type="text" defaultValue={user.displayName} className="input-field" />
          </div>
          <div>
            <label className="input-label">Bio</label>
            <textarea name="bio" defaultValue={user.bio} rows={3} className="input-field resize-none" placeholder="Tell readers about yourself..." />
          </div>
          <button type="submit" className="btn-primary text-sm">Save Profile</button>
        </form>
      </section>

      {/* Appearance */}
      <section className="card-flat p-5 sm:p-6 animate-fade-in animate-delay-200">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Appearance</h2>
        <form action={updateSiteSettingsAction} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="input-label">Site Name</label>
              <input name="siteName" type="text" defaultValue={settings?.siteName} className="input-field" />
            </div>
            <div>
              <label className="input-label">Tagline</label>
              <input name="tagline" type="text" defaultValue={settings?.tagline} className="input-field" placeholder="A short description..." />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="input-label">Accent Color</label>
              <div className="flex items-center gap-2">
                <input name="accentColor" type="color" defaultValue={settings?.accentColor || "#0d9488"} className="h-9 w-11 rounded-lg border border-border cursor-pointer" />
                <span className="text-xs text-muted font-mono">{settings?.accentColor || "#0d9488"}</span>
              </div>
            </div>
            <div>
              <label className="input-label">Background</label>
              <div className="flex items-center gap-2">
                <input name="bgColor" type="color" defaultValue={settings?.bgColor || "#fafaf9"} className="h-9 w-11 rounded-lg border border-border cursor-pointer" />
                <span className="text-xs text-muted font-mono">{settings?.bgColor || "#fafaf9"}</span>
              </div>
            </div>
            <div>
              <label className="input-label">Text Color</label>
              <div className="flex items-center gap-2">
                <input name="textColor" type="color" defaultValue={settings?.textColor || "#1c1917"} className="h-9 w-11 rounded-lg border border-border cursor-pointer" />
                <span className="text-xs text-muted font-mono">{settings?.textColor || "#1c1917"}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="input-label">Font</label>
            <div className="flex gap-3">
              {(["serif", "sans", "mono"] as const).map((f) => (
                <label key={f} className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="radio" name="fontFamily" value={f} defaultChecked={settings?.fontFamily === f} className="text-accent" />
                  <span className={`text-sm ${f === "serif" ? "font-serif" : f === "mono" ? "font-mono" : "font-sans"}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Header Style</label>
            <div className="flex gap-3">
              {(["minimal", "bold", "centered"] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="radio" name="headerStyle" value={s} defaultChecked={settings?.headerStyle === s} className="text-accent" />
                  <span className="text-sm">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" name="showBio" value="true" defaultChecked={settings?.showBio} className="h-4 w-4 rounded border-border text-accent" />
            <span className="text-sm text-muted-dark">Show bio on blog</span>
          </label>

          <button type="submit" className="btn-primary text-sm">Save Appearance</button>
        </form>
      </section>

      {/* Social Links */}
      <section className="card-flat p-5 sm:p-6 animate-fade-in animate-delay-300">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Social Links</h2>
        <form action={updateSiteSettingsAction} className="space-y-4">
          {/* Hidden defaults so other fields aren't cleared */}
          <input type="hidden" name="siteName" value={settings?.siteName || ""} />
          <input type="hidden" name="tagline" value={settings?.tagline || ""} />
          <input type="hidden" name="accentColor" value={settings?.accentColor || "#0d9488"} />
          <input type="hidden" name="bgColor" value={settings?.bgColor || "#fafaf9"} />
          <input type="hidden" name="textColor" value={settings?.textColor || "#1c1917"} />
          <input type="hidden" name="fontFamily" value={settings?.fontFamily || "serif"} />
          <input type="hidden" name="headerStyle" value={settings?.headerStyle || "centered"} />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="input-label">Twitter / X</label>
              <input name="twitter" type="text" defaultValue={settings?.socialLinks?.twitter} className="input-field text-sm" placeholder="@username" />
            </div>
            <div>
              <label className="input-label">GitHub</label>
              <input name="github" type="text" defaultValue={settings?.socialLinks?.github} className="input-field text-sm" placeholder="username" />
            </div>
            <div>
              <label className="input-label">Website</label>
              <input name="website" type="url" defaultValue={settings?.socialLinks?.website} className="input-field text-sm" placeholder="https://..." />
            </div>
          </div>
          <button type="submit" className="btn-primary text-sm">Save Links</button>
        </form>
      </section>

      {/* Ads on your subdomain */}
      <section className="card-flat p-5 sm:p-6 animate-fade-in animate-delay-400">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-muted">
          Ads on your blog
        </h2>
        <p className="mb-4 text-xs leading-relaxed text-muted-dark">
          When enabled, your HTML snippets render on your public subdomain and post pages
          (below the nav, after the article, and above the footer). Paste your ad network
          embed code (e.g. Google AdSense). You are responsible for complying with the
          network&apos;s policies; scripts run on your readers&apos; browsers.
        </p>
        <form action={updateAdSettingsAction} className="space-y-4">
          <label className="flex cursor-pointer items-center gap-2.5 select-none">
            <input
              type="checkbox"
              name="adsEnabled"
              value="true"
              defaultChecked={settings?.adsEnabled}
              className="h-4 w-4 rounded border-border text-accent"
            />
            <span className="text-sm text-muted-dark">Show ads on my public site</span>
          </label>
          <div>
            <label className="input-label">Header slot (below navigation)</label>
            <textarea
              name="adSlotHeader"
              rows={4}
              defaultValue={settings?.adSlotHeader}
              className="input-field resize-y font-mono text-xs"
              placeholder="<!-- e.g. AdSense unit -->"
            />
          </div>
          <div>
            <label className="input-label">In-article slot (after post body)</label>
            <textarea
              name="adSlotInArticle"
              rows={4}
              defaultValue={settings?.adSlotInArticle}
              className="input-field resize-y font-mono text-xs"
              placeholder="Optional mid-content placement"
            />
          </div>
          <div>
            <label className="input-label">Footer slot (above site footer)</label>
            <textarea
              name="adSlotFooter"
              rows={4}
              defaultValue={settings?.adSlotFooter}
              className="input-field resize-y font-mono text-xs"
              placeholder="<!-- bottom banner -->"
            />
          </div>
          <button type="submit" className="btn-primary text-sm">
            Save ad settings
          </button>
        </form>
      </section>

      {/* Preview */}
      <section className="card-flat p-5 sm:p-6 animate-fade-in animate-delay-500">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-3">Preview</h2>
        <Link href={`/p/${user.username}`} className="btn-secondary text-sm inline-flex">
          Open {user.username}.kotha.blog →
        </Link>
      </section>
    </div>
  );
}
