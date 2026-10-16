// Isolated UI review only: loopback fixture API, copied app, synthetic identities, no hosted credentials.
// Never imported by application routes. NOT evidence of hosted Auth/RLS/Storage behavior.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import {
  mkdtemp,
  cp,
  symlink,
  mkdir,
  rm,
  writeFile,
  readFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import sharp from "sharp";
process.env.XDG_CACHE_HOME = "/tmp/turkindo-font-cache";
await mkdir(process.env.XDG_CACHE_HOME, { recursive: true });
const root = process.cwd(),
  out = resolve(
    process.env.REVIEW_OUTPUT_DIR || "/workspace/review/turkindo-product",
  );
await mkdir(out, { recursive: true });
const uid = "10000000-0000-4000-8000-000000000001",
  pid = "20000000-0000-4000-8000-000000000001",
  photo = "30000000-0000-4000-8000-000000000001",
  conv = "40000000-0000-4000-8000-000000000001";
const otherPid = "20000000-0000-4000-8000-000000000002";
const own = {
  user_id: uid,
  public_id: pid,
  display_name: "TEST Deniz",
  date_of_birth: "1991-01-01",
  gender: "undisclosed",
  country: "TR",
  city: "İzmir",
  biography:
    "VISUAL TEST FIXTURE ONLY. I enjoy learning languages, cooking and a good book.",
  discoverable: true,
  completed_at: new Date().toISOString(),
};
const catalogs = {
  countries: [
    ["TR", "Türkiye", "Türkiye", "Türkiye"],
    ["ID", "Indonesia", "Endonezya", "Indonesia"],
  ],
  purposes: [
    ["friendship", "Friendship", "Arkadaşlık", "Persahabatan"],
    ["serious", "Serious relationship", "Ciddi ilişki", "Hubungan serius"],
    ["marriage", "Marriage", "Evlilik", "Pernikahan"],
    ["language", "Language exchange", "Dil değişimi", "Pertukaran bahasa"],
  ],
  languages: [
    ["tr", "Turkish", "Türkçe", "Bahasa Turki"],
    ["id", "Bahasa Indonesia", "Endonezce", "Bahasa Indonesia"],
    ["en", "English", "İngilizce", "Bahasa Inggris"],
  ],
  interests: [
    ["books", "Books", "Kitaplar", "Buku"],
    ["food", "Food", "Yemek", "Kuliner"],
    ["travel", "Travel", "Seyahat", "Perjalanan"],
  ],
};
for (const k of Object.keys(catalogs))
  catalogs[k] = catalogs[k].map(([code, en, tr, id]) => ({
    code,
    labels: { en, tr, id },
    active: true,
  }));
const members = [
  {
    public_id: otherPid,
    display_name: "TEST Maya",
    age: 29,
    gender: "undisclosed",
    country: "ID",
    city: "Bandung",
    biography:
      "VISUAL TEST FIXTURE ONLY. Books, family recipes and new perspectives. Learning Turkish, one conversation at a time.",
    purposes: ["serious", "friendship"],
    speaks: ["id", "en"],
    learns: ["tr"],
    interests: ["books", "food"],
    verification: "email",
    photo_id: photo,
    interested: false,
    favorited: false,
  },
  {
    public_id: "20000000-0000-4000-8000-000000000003",
    display_name: "TEST Arif",
    age: 33,
    gender: "undisclosed",
    country: "ID",
    city: "Jakarta",
    biography:
      "VISUAL TEST FIXTURE ONLY. A curious reader who enjoys cooking and discovering a new language.",
    purposes: ["friendship", "language"],
    speaks: ["id", "en"],
    learns: ["tr"],
    interests: ["books", "travel"],
    verification: "email",
    photo_id: photo,
    interested: false,
    favorited: true,
  },
];
const optional = {
  nationality: "ID",
  relocation: "maybe",
  future_country: "TR",
  education: "TEST · Design studies",
  profession: "TEST · Designer",
  children: "discuss",
  destinations: ["TR"],
  shared: true,
};
const messages = [
  {
    id: "1",
    body: "TEST · I noticed we both enjoy books. What are you reading?",
    mine: true,
    created_at: "2026-10-16T10:00:00Z",
  },
  {
    id: "2",
    body: "TEST · A collection of short stories! What kind of books do you enjoy?",
    mine: false,
    created_at: "2026-10-16T10:01:00Z",
  },
];
// Clearly illustrated placeholders: no real member photographs or impersonated people.
const portrait = await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="650"><rect width="700" height="650" fill="#c4d0bf"/><path d="M0 550Q330 260 700 550V650H0" fill="#567260"/><ellipse cx="350" cy="280" rx="125" ry="165" fill="#e2be95"/><path d="M215 295Q170 70 355 60Q530 75 485 340L460 230Q320 190 260 200L250 360" fill="#443d33"/><path d="M210 650V560Q350 450 490 560V650" fill="#b5754f"/><path d="M310 345Q350 375 390 345" fill="none" stroke="#825a47" stroke-width="7"/><circle cx="310" cy="270" r="8" fill="#443d33"/><circle cx="390" cy="270" r="8" fill="#443d33"/><text x="350" y="615" fill="white" text-anchor="middle" font-size="22" font-family="sans-serif">ILLUSTRATION · TEST FIXTURE</text></svg>`,
  ),
)
  .webp()
  .toBuffer();
let onboarding = false;
const api = createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://fixture");
    let body = "";
    for await (const b of req) body += b;
    const args = body ? JSON.parse(body) : {};
    const object = req.headers.accept?.includes("vnd.pgrst.object");
    const respond = (x, status = 200) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(x));
    };
    if (u.pathname === "/auth/v1/user")
      return respond({
        id: uid,
        aud: "authenticated",
        role: "authenticated",
        email: "visual-test@example.test",
        email_confirmed_at: "2026-01-01T00:00:00Z",
        app_metadata: { provider: "email" },
        user_metadata: {},
      });
    if (u.pathname.startsWith("/storage/")) {
      res.writeHead(200, { "content-type": "image/webp" });
      res.end(portrait);
      return;
    }
    const table = u.pathname.split("/").at(-1);
    if (u.pathname.includes("/rpc/")) {
      if (table === "member_active") return respond(true);
      if (table === "member_context") return respond(optional);
      if (table === "member_profile")
        return respond(
          members.find((x) => x.public_id === args.profile_id) || members[0],
        );
      if (
        [
          "search_product_members",
          "search_members",
          "discover_members",
        ].includes(table)
      )
        return respond(
          members.filter(
            (m) =>
              (!args.name_filter ||
                m.display_name.includes(args.name_filter)) &&
              (!args.country_filter || m.country === args.country_filter),
          ),
        );
      if (table === "read_thread")
        return respond({ member: members[0], messages });
      if (table === "my_matches")
        return respond([{ ...members[0], matched_at: "2026-10-15T10:00:00Z" }]);
      if (table === "favorite_members") return respond([members[1]]);
      if (table === "my_blocks") return respond([]);
      if (table === "list_conversations")
        return respond([
          {
            id: conv,
            member: members[0],
            created_at: "2026-10-16T10:00:00Z",
            unread: true,
          },
        ]);
      if (table === "open_conversation") return respond(conv);
      if (table === "consume_auth_attempt") return respond(true);
      return respond(null);
    }
    let rows = [];
    if (catalogs[table]) rows = catalogs[table];
    else if (table === "profiles")
      rows = [
        {
          ...own,
          public_id:
            u.searchParams.has("user_id") &&
            u.searchParams.get("user_id") !== `eq.${uid}`
              ? otherPid
              : pid,
          completed_at: onboarding ? null : own.completed_at,
        },
      ];
    else if (table === "user_purposes")
      rows = [{ code: "serious" }, { code: "friendship" }];
    else if (table === "user_interests")
      rows = [{ code: "books" }, { code: "food" }];
    else if (table === "user_languages")
      rows = [
        { code: "tr", kind: "speak" },
        { code: "en", kind: "speak" },
        { code: "id", kind: "learn" },
      ];
    else if (table === "profile_photos")
      rows = [{ id: photo, user_id: uid, storage_path: uid + "/test.webp" }];
    else if (table === "member_preferences") rows = [];
    respond(object ? rows[0] || null : rows);
  } catch {
    res.writeHead(500);
    res.end("{}");
  }
});
await new Promise((r) => api.listen(0, "127.0.0.1", r));
const backend = `http://127.0.0.1:${api.address().port}`;
const dir = await mkdtemp(join(tmpdir(), "turkindo-ui-review-"));
let app, browser;
try {
  for (const f of [
    "src",
    "public",
    "next.config.ts",
    "postcss.config.mjs",
    "tsconfig.json",
    "next-env.d.ts",
    "package.json",
  ])
    try {
      await cp(join(root, f), join(dir, f), { recursive: true });
    } catch (e) {
      if (f !== "public") throw e;
    }
  await symlink(join(root, "node_modules"), join(dir, "node_modules"), "dir");
  const port = 3207,
    origin = `http://127.0.0.1:${port}`;
  const env = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: backend,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "visual-fixture-key",
    SUPABASE_SERVICE_ROLE_KEY: "visual-fixture-service-key",
    NEXT_PUBLIC_SITE_URL: origin,
  };
  delete env.DATABASE_URL;
  delete env.SUPABASE_ACCESS_TOKEN;
  await new Promise((resolve, reject) => {
    const build = spawn(
      "node",
      [join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"],
      { cwd: dir, env, stdio: "ignore" },
    );
    build.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error("Isolated visual build failed")),
    );
  });
  app = spawn(
    "node",
    [
      join(root, "node_modules/next/dist/bin/next"),
      "start",
      "--port",
      String(port),
    ],
    { cwd: dir, env, stdio: "ignore" },
  );
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(origin + "/en")).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  assert.ok(ready);
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const ctx = await browser.newContext();
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const jwt = [
    { alg: "HS256", typ: "JWT" },
    { sub: uid, aud: "authenticated", role: "authenticated", exp },
    "visual-only",
  ]
    .map((x) =>
      typeof x === "string"
        ? x
        : Buffer.from(JSON.stringify(x)).toString("base64url"),
    )
    .join(".");
  const session = {
    access_token: jwt,
    refresh_token: "visual-only",
    expires_at: exp,
    expires_in: 3600,
    token_type: "bearer",
    user: { id: uid, email: "visual-test@example.test" },
  };
  await ctx.addCookies([
    {
      name: "sb-127-auth-token",
      value:
        "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url"),
      url: origin,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const page = await ctx.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const shots = [
    ["01-home-desktop", "/en", 1440],
    ["02-home-mobile", "/tr", 390],
    ["03-discovery-desktop", "/en/app/discover", 1440],
    ["04-discovery-mobile", "/tr/app/discover", 390],
    ["05-member-profile", "/en/app/members/" + otherPid, 1440],
    ["06-member-profile-mobile", "/id/app/members/" + otherPid, 390],
    ["07-messaging", "/en/app/messages/" + conv, 1200],
    ["08-marriage-center", "/en/app/marriage", 1440],
    ["09-premium", "/en/app/premium", 1200],
    ["10-registration", "/en/auth/signup", 390],
    ["11-mobile-menu", "/tr/app/more", 390],
    ["12-profile-edit", "/en/app/profile", 1200],
  ];
  const results = [];
  for (const [name, path, width] of shots) {
    await page.setViewportSize({ width, height: 900 });
    const r = await page.goto(origin + path);
    assert.equal(r.status(), 200, name);
    await page.waitForTimeout(150);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      name + " horizontal overflow",
    );
    if (path.includes("/app/discover")) {
      assert.equal(await page.locator(".member-card").count(), 2);
      assert.equal(await page.locator(".member-nav > a").count(), 4);
      assert.equal(await page.locator(".insights.compact").count(), 2);
      await page
        .getByRole("link", {
          name: width < 800 ? "Yeni katılanlar" : "New members",
          exact: true,
        })
        .click();
      await page.waitForURL((u) => u.searchParams.get("view") === "new");
    }
    if (name === "12-profile-edit")
      await page.locator(".context-editor summary").click();
    if (name === "07-messaging") {
      await page.locator(".conversation-starters summary").click();
      await page.locator(".starter-option").first().click();
      assert.ok((await page.locator("#message-draft").inputValue()).length > 0);
      assert.equal(await page.locator(".message-bubble").count(), 2);
    }
    await page.screenshot({ path: join(out, name + ".png"), fullPage: true });
    results.push(name);
    if (name === "03-discovery-desktop") {
      for (const [selector, file] of [
        [".member-card", "14-member-card"],
        [".filters", "15-filters"],
        [".insights.compact", "16-compatibility"],
      ]) {
        await page
          .locator(selector)
          .first()
          .screenshot({ path: join(out, file + ".png") });
        results.push(file);
      }
    }
    if (name === "04-discovery-mobile") {
      for (const width of [375, 768]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          "discovery overflow at " + width,
        );
        const nav = page.locator(".member-nav");
        assert.ok(
          await nav.evaluate((e) => e.scrollWidth <= e.clientWidth),
          "navigation horizontal scroll",
        );
        await page.setViewportSize({ width: 390, height: 900 });
      }
    }
  }
  onboarding = true;
  await page.goto(origin + "/en/app/onboarding");
  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.screenshot({
    path: join(out, "13-onboarding.png"),
    fullPage: true,
  });
  assert.equal(errors.length, 0, "browser runtime errors");
  await writeFile(
    join(out, "REVIEW.md"),
    "# TurkIndo product review\n\nRendered from actual application routes in an isolated app copy. All member identities, conversations and illustrated portraits here are **synthetic visual test fixtures**, never production members. The fixture API is loopback-only and is not a security or hosted integration test.\n\n" +
      results
        .concat("13-onboarding")
        .map((x) => `- [${x}](${x}.png)`)
        .join("\n"),
  );
  console.log(
    JSON.stringify({
      renderedScreens: results.length + 1,
      browserErrors: errors.length,
      responsiveChecks: "passed",
      reviewDirectory: out,
      fixtures: "isolated visual only; not hosted proof",
    }),
  );
} finally {
  await browser?.close();
  app?.kill();
  await new Promise((r) => api.close(r));
  await rm(dir, { recursive: true, force: true });
}
