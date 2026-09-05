from django.utils.translation import get_language_bidi
from dashboard.models import Space, SpaceCategory, SpaceCategoryImages


def get_website_name():
    """
    Returns the website name based on the current language direction.
    """
    if get_language_bidi():
        return "ذكي الإستغلال"
    else:
        return "Smart Operating Cycle"


def build_gallery_data(spaces_queryset=None, only_featured_images=False):
    """
    Builds the structured gallery hierarchy for V23 Inspiration Gallery:
    Space -> Categories -> Sub-categories -> Images.
    If only_featured_images is True, only includes images marked is_default=True,
    and omits spaces/categories without any featured images.
    """
    if spaces_queryset is None:
        spaces_queryset = Space.objects.prefetch_related("categories__images").all()

    gallery_data = []
    for sp in spaces_queryset:
        sp_thumb = sp.thumbnail.url if sp.thumbnail else ""
        cats_list = []
        categories = list(sp.categories.all())

        for cat in categories:
            all_cat_imgs = list(cat.images.all())
            if not all_cat_imgs:
                continue

            featured_imgs = [img for img in all_cat_imgs if img.is_default]

            if only_featured_images:
                if not featured_imgs:
                    continue
                cat_cover = featured_imgs[0].image.url
                featured_urls = [img.image.url for img in featured_imgs]
                other_imgs = [img for img in all_cat_imgs if not img.is_default]
                cat_imgs = featured_imgs + other_imgs
            else:
                cat_cover = featured_imgs[0].image.url if featured_imgs else all_cat_imgs[0].image.url
                featured_urls = [cat_cover]
                cat_imgs = all_cat_imgs

            subs_list = []
            tag_groups = {}
            for img in cat_imgs:
                tag_name = img.tags.split(",")[0].strip() if img.tags else ""
                ref_name = img.reference.strip() if img.reference else ""
                if "/" in ref_name or "\\" in ref_name or "." in ref_name:
                    ref_name = ""
                grp = tag_name or ref_name or "Vue d’ensemble"
                if grp not in tag_groups:
                    tag_groups[grp] = []
                tag_groups[grp].append(img.image.url)

            for grp_name, urls in tag_groups.items():
                subs_list.append({
                    "name": grp_name,
                    "images": urls,
                })

            cats_list.append({
                "id": f"{sp.slug or sp.id}-{cat.id}",
                "name": cat.category_name,
                "cover": cat_cover,
                "featured_images": featured_urls,
                "subs": subs_list,
            })

        if cats_list or not only_featured_images:
            gallery_data.append({
                "id": sp.slug or str(sp.id),
                "name": sp.name,
                "cover": sp_thumb or (cats_list[0]["cover"] if cats_list else ""),
                "categories": cats_list,
            })

    return gallery_data

