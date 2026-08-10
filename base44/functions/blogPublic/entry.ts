import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";
    const base44 = createClientFromRequest(req);

    if (action === "get") {
      const slug = String(body.slug || "");
      if (!slug) return Response.json({ error: "slug required" }, { status: 400 });
      const items = await base44.asServiceRole.entities.BlogArticle.filter({ slug, status: "published" }, "-published_date", 1);
      if (!items || items.length === 0) return Response.json({ error: "not_found" }, { status: 404 });
      return Response.json({ article: items[0] });
    }

    const query = { status: "published" };
    if (body.category) query.category = body.category;
    const items = await base44.asServiceRole.entities.BlogArticle.filter(query, "-published_date", 50);
    const summary = (items || []).map((a) => ({
      id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt, category: a.category,
      tags: a.tags, author_name: a.author_name, published_date: a.published_date,
      cover_image_url: a.cover_image_url, is_featured: a.is_featured,
      reading_minutes: a.reading_minutes, lang: a.lang
    }));
    const featured = summary.find((a) => a.is_featured) || summary[0] || null;
    return Response.json({ articles: summary, featured });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}