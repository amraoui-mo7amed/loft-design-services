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


def build_gallery_data(spaces_queryset=None):
    """
    Builds the structured gallery hierarchy for V23 Inspiration Gallery:
    Space -> Categories -> Sub-categories -> Images.
    """
    if spaces_queryset is None:
        spaces_queryset = Space.objects.prefetch_related("categories__images").all()

    gallery_data = []
    for sp in spaces_queryset:
        sp_thumb = sp.thumbnail.url if sp.thumbnail else ""
        cats_list = []
        categories = list(sp.categories.all())

        for cat in categories:
            cat_imgs = list(cat.images.all())
            cat_cover = cat_imgs[0].image.url if cat_imgs else sp_thumb

            subs_list = []
            if cat_imgs:
                tag_groups = {}
                for img in cat_imgs:
                    tag_name = img.tags.split(",")[0].strip() if img.tags else ""
                    grp = tag_name or img.reference or "Vue d’ensemble"
                    if grp not in tag_groups:
                        tag_groups[grp] = []
                    tag_groups[grp].append(img.image.url)

                for grp_name, urls in tag_groups.items():
                    subs_list.append({
                        "name": grp_name,
                        "images": urls,
                    })
            else:
                subs_list.append({
                    "name": "Vue d’ensemble",
                    "images": [cat_cover] if cat_cover else [],
                })

            cats_list.append({
                "id": f"{sp.slug or sp.id}-{cat.id}",
                "name": cat.category_name,
                "cover": cat_cover,
                "subs": subs_list,
            })

        gallery_data.append({
            "id": sp.slug or str(sp.id),
            "name": sp.name,
            "cover": sp_thumb,
            "categories": cats_list,
        })

    return gallery_data

