"""LAV prompt constructor v4 ("lav-master-v4").

Built on the owner's production master prompt. The master text is split into blocks;
blocks that depend on UI controls (change level, goal, style, colour, room, comment)
are swapped automatically. Every section records which control drives it so the
owner debug panel can show why the final prompt looks the way it does.

v3 (after the first 7 paid tests):
* the style reference is a mood board, NOT a catalogue (no 1:1 copies -> IP risk);
* 1-3 references are blended; the design goal decides WHAT changes.

v4 (after the second 7 paid tests):
* four explicit change levels with a clear "may change / must stay" contract:
  decor only (home staging) / finishes + decor / furniture + decor / full redesign;
  everything that MAY change is changed at full strength and takes the most from the references;
* "finishes + decor" keeps the same furniture pieces (only realistic refreshes: covers,
  reupholstery, repainted fronts, new handles) and must remove old wallpaper;
* lighting rules depend on the level: plug-in lamps only / existing fixtures replaced in
  the same spots / free but logical lighting only in the full redesign;
* handleless joinery for modern styles (one short line, the owner's wording);
* "add colour" uses the colour the client chose;
* optional "variation" nudges (bolder / calmer / more decor) for the next variant.
"""

from __future__ import annotations

PROMPT_VERSION = "lav-master-v4"

ROOM_NAMES = {
    "living_room": "living room", "kitchen_living": "open-plan kitchen-living room", "bedroom": "bedroom", "kitchen": "kitchen", "dining_room": "dining room",
    "bathroom": "bathroom", "kids_room": "children's room", "office": "home office", "hallway": "hallway",
    "wardrobe": "walk-in wardrobe", "house": "house exterior", "facade": "building facade", "villa": "villa",
    "terrace": "terrace", "courtyard": "courtyard", "garden": "garden",
}

COLOR_NAMES = {
    "beige": "warm beige", "white": "soft white", "brown": "rich brown", "dark": "deep dark charcoal",
    "green": "muted green", "blue": "blue", "pink": "dusty pink", "yellow": "ochre yellow",
    "red": "burgundy red", "light_wood": "pale natural oak", "light": "light ivory", "grey": "warm grey",
    "dark_wood": "dark walnut", "black": "black",
}

GOAL_BLOCKS = {
    "cozier": (
        "Make the room feel warm, lived-in and inviting in a contemporary designer way, exactly like the style references: "
        "warm natural wood, tactile layered textiles (linen, wool, boucle), a generous soft rug, curtains in natural fabric, "
        "a few sculptural ceramics, books and living branches, soft layered lamplight. "
        "Avoid clichés: no rows of candles, no fairy lights, no fake fur clutter, no country or 2000s decor. "
        "Cozy is NOT yellow: keep a clean neutral daylight white balance."
    ),
    "more_luxurious": (
        "Make the room look visibly more expensive in a light, refined way, exactly like the style references: noble materials "
        "(natural stone, fine wood veneer, satin brass accents), high-quality upholstery, elegant proportions, a curated and "
        "uncluttered composition and a calm light palette. Avoid heavy dark gloss, gaudy gold and cheap decorative excess."
    ),
    "brighter": (
        "Make the room brighter and airier: lighter colours, light textiles, light-reflecting surfaces, mirrors and open, "
        "light styling that lets daylight spread, using the design techniques of the style references. Curtains and textiles "
        "only in light tones (white, ivory, pale linen); no dark curtains or heavy dark accents. "
        "Keep it natural: no overexposure and no blown-out windows."
    ),
    "more_designer": (
        "Make the room feel clearly designed by an interior architect, exactly like the style references: one or two "
        "sculptural statement pieces, a large expressive artwork, an unusual designer light, considered colour and material "
        "contrasts and an editorial, curated composition. Bold but coherent, never cluttered or kitsch."
    ),
    "more_modern": (
        "Make the room contemporary: clean lines, current forms, refined surfaces, a restrained palette and current decor. "
        "Remove dated details, but avoid a cold or sterile look."
    ),
    "add_color": (
        "Bring colour into the room in a designer way: choose one main accent colour plus one supporting shade that suit "
        "the style. Introduce the accent colour primarily through upholstery, textiles (curtains, throw, cushions, bench or rug) "
        "and, where surfaces may change, refined architectural surfaces. Keep the rest calm: no rainbow effect and no cheap matching poster grids."
    ),
    "more_minimal": (
        "Make the room calmer and more minimal: remove clutter and most small decor, keep only a few essential, "
        "well-designed pieces, clean surfaces and generous negative space, while keeping the room warm and livable through "
        "material texture rather than objects."
    ),
    "full_transform": (
        "Create a bold, magazine-worthy redesign. Change the wall and ceiling finishes, flooring, joinery, furniture, "
        "lighting and decor decisively, so that the result is a clearly different interior, while the architecture, "
        "windows, doors and camera angle remain exactly as in the first image."
    ),
}

PALETTE_BLOCKS = {
    "beige": "Palette: warm beige neutrals with soft ivory, limestone tones and light natural wood.",
    "white": "Palette: soft whites, off-whites, pale limestone and restrained light wood accents.",
    "brown": "Palette: layered browns with walnut, taupe, caramel and balanced cream accents.",
    "dark": "Palette: a dark, moody scheme with walnut, charcoal, deep taupe and restrained metallic accents.",
    "green": "Accent colour: muted sage or olive green used sparingly as 2-3 small accents only (for example a couple of cushions, one vase or a throw). Curtains, rug, walls and large surfaces stay calm neutral; the room must not look green.",
    "blue": "Accent colour: dusty blue or slate blue used sparingly as 2-3 small accents only (for example a couple of cushions, one vase or a throw). Curtains, rug, walls and large surfaces stay calm neutral; the room must not look blue, and the artwork does not have to be blue.",
    "pink": "Accent colour: dusty rose or clay pink used sparingly as 2-3 small accents only (cushions, a vase, a throw). Large surfaces stay calm neutral; the room must not look pink.",
    "yellow": "Accent colour: ochre or warm mustard used sparingly as 2-3 small accents only (cushions, a vase, a throw), no yellow cast. Large surfaces stay calm neutral.",
    "red": "Accent colour: burgundy or muted terracotta used sparingly as 2-3 small accents only (cushions, a vase, a throw). Large surfaces stay calm neutral; the room must not look red.",
    "light_wood": "Palette: pale oak, ivory, linen and soft mineral neutrals for a light natural look.",
    "light": "Palette: a light, airy scheme of white, ivory, pale stone and subtle natural wood.",
    "grey": "Palette: layered greys, greige, mineral stone and soft off-white rather than cold flat grey.",
    "dark_wood": "Palette: dark walnut or smoked oak with stone, cream textiles and restrained brass accents.",
    "black": "Palette: black as a precise architectural accent balanced by neutrals, texture and natural materials.",
}

STYLE_HINTS = {
    "organic_modern": "Organic Modern: sculptural simplicity, tactile natural materials (boucle, travertine, limewash, warm oak), rounded contemporary forms and quiet layered neutrals. Smooth modern walls without classical mouldings.",
    "quiet_luxury": "Quiet Luxury: restrained contemporary elegance, exceptional material quality (natural stone slabs, fine wood veneer, brushed bronze), precise modern detailing and timeless proportions. Clean architectural walls without classical boiserie mouldings.",
    "american": "Refined American style: comfortable proportions, tailored upholstery, warm woods and composed architectural detailing.",
    "minimalism": "Warm minimalism: disciplined contemporary forms, visual calm, material depth, flush surfaces without mouldings, and purposeful negative space.",
    "scandinavian": "Refined Scandinavian modern style: bright airy atmosphere, light natural oak, smooth light walls without classical mouldings, functional clarity and soft organic textures.",
    "contemporary_classic": "Contemporary classic (Neoclassic): balanced symmetry, elegant wall mouldings (boiserie), herringbone parquet, modern restraint and timeless materials.",
    "mediterranean": "New Mediterranean: mineral plaster, limewash, natural stone, crafted wood, soft curves and sun-washed natural tones without classical mouldings.",
    "eclectic": "Curated eclectic: a controlled mix of sculptural character pieces, large-scale contemporary art and rich materials in a coherent editorial composition.",
}

# styles / goals where cabinetry should be handleless (owner: "one short line is enough")
HANDLELESS_STYLES = {"minimalism", "organic_modern", "quiet_luxury", "scandinavian"}
HANDLELESS_GOALS = {"more_modern", "more_minimal"}
HANDLELESS_LINE = "Cabinetry, kitchen fronts and wardrobes have no visible handles: integrated grip profiles or push-to-open fronts."
MODERN_WALLS_LINE = ("Architectural Discipline: keep walls and doors sleek and contemporary (smooth plaster, paint, stone slabs or wood panels); "
                     "do NOT add classical boiserie wall mouldings, ornate cornices or classical panelled doors.")

VARIATION_BLOCKS = {
    "bolder": ("Variation for this version: make it bolder and more expressive: richer, more characterful materials and "
               "textures, stronger contrast and more statement pieces, still within the allowed changes."),
    "calmer": ("Variation for this version: make it calmer and softer: a quieter palette, fewer and simpler objects, "
               "more negative space and gentle textures, still within the allowed changes."),
    "more_decor": ("Variation for this version: add noticeably more styling and decor: more layered textiles, large-scale art, plants, "
                   "books, ceramics and small accent pieces, curated and not cluttered."),
}

# --- change-level building blocks. "REF" -> "the style reference(s)" / "the chosen design direction" ---
SURFACE = ("Surface Transformation (mandatory): walls, floor and ceiling are visibly re-finished in the colour palette and "
           "material language of REF (matte paint, limewash, microcement, wood veneer panels or stone slabs). Any existing "
           "wallpaper and old wall finish are completely removed and replaced. Preserve the architectural type of doors (for example, "
           "keep concealed frameless doors sleek and flush). The change must be clearly visible, not a subtle tint.")
ARCH_DETAILS = ("Architectural Finishes: ceiling design, built-in joinery, kitchen fronts, worktops, backsplash and "
                "door finishes are redesigned in the spirit of REF, while walls, windows and doors stay in their exact positions.")
KEEP_SURFACES = ("Surfaces Preserved: walls, wallpaper, floor, ceiling, doors, windows and built-in elements keep their current "
                 "materials and colours exactly.")
FURNITURE_KEEP = ("Furniture Preserved (strict): every piece of furniture stays exactly the same piece - same shape, size, colour, "
                  "upholstery fabric and finish, same position and the same number of chairs. The dining table keeps its exact "
                  "top shape, top material and base. Never remove a chair and never copy chairs, tables or sofas from the style "
                  "references; take only decor, textiles, art and lighting ideas from them.")
WALL_DECOR = ("Empty walls: any large empty wall surface visible in the photo must be styled with a hung decorative object taken "
              "from the ideas of the style references - for example a textured plaster relief, a fluted or sculpted decorative "
              "panel, a large mirror, a curated gallery-quality artwork or a pair of plug-in sconces, scaled to the wall. "
              "Avoid generic flat colour-block or blob abstract posters. Hung objects only: no mouldings, no repainting, no wallpaper.")
FURNITURE_REFRESH = ("Furniture Kept and Refreshed: every piece of furniture stays the same piece with the same form, size and "
                     "position; no new cabinets, wardrobes, dressers, shelving units or tables are added. Only realistic refreshes "
                     "are allowed: new covers or upholstery on sofas, chairs, benches and the bed in the materials of REF, repainted or "
                     "re-wrapped cabinet and kitchen fronts, new handles.")
FURNITURE_REPLACE = ("Furniture Redesign: furniture pieces are replaced with new, contemporary designer pieces inspired by the silhouettes and forms of REF, not "
                     "copies of any piece shown in REF. Every new piece keeps the same position, footprint, orientation and "
                     "approximate scale as the original piece.")
TEXTILES = ("Textile Refresh: cushions, throws, bedding, curtains and rugs are replaced or added in the colours and material "
            "families of REF (new patterns and shapes, not copies).")
DECOR = ("Decor and Styling at full strength: first remove all household clutter, random bags, boxes, bottles, cables and loose everyday items, "
         "then style the room generously as an interior designer would in the spirit of REF: sculptural ceramics, vases with branches or greenery, "
         "books, trays, candles and, where wall art fits naturally, at most one large-scale contemporary canvas or sculptural relief "
         "(NEVER hang a grid or cluster of multiple small framed pictures). Where there is free floor space, small accent pieces such as "
         "a side table, pouf or plant stand may be added. All decor is adapted to this room.")
LIGHT_PLUGIN = ("Lighting: no new ceiling or wall-wired fixtures. Ceiling lights stay as they are. Plug-in light may be added "
                "only where it is logical: floor lamps beside sofas or armchairs, table lamps only on sideboards, consoles, "
                "desks or bedside tables, plug-in wall sconces and candles - never put a table lamp on a dining table or a kitchen worktop. "
                "Lamps and sconces are switched on with a soft warm glow, while the overall daylight white balance stays neutral.")
LIGHT_SAME_SPOTS = ("Lighting: existing ceiling and wall fixtures are replaced with new designer fixtures in exactly the same spots; "
                    "no new hanging fixtures in new places. Hidden LED cove light may be added only as part of the new ceiling "
                    "finish. Table and floor lamps may be added freely.")
LIGHT_FULL = ("Lighting: a new, logical lighting plan in the spirit of REF. Pendants only above a dining table, island or bed "
              "zone, at most one hanging light solution per zone, no random fixtures over worktops or empty floor. Hidden LED "
              "lines, track lights, sconces and lamps may be used where they make sense.")
LIGHT_NO_COPY = " Never use the same fixture models as in REF."

CHANGE_LEVELS = {
    # "Только декор": home staging, nothing is renovated or bought except decor/textiles/lamps
    "details_only": [KEEP_SURFACES, FURNITURE_KEEP, TEXTILES, DECOR, WALL_DECOR, LIGHT_PLUGIN],
    # "Отделка и декор": cosmetic renovation, the client keeps their furniture
    "finishes_decor": [SURFACE, FURNITURE_REFRESH, TEXTILES, DECOR, WALL_DECOR, LIGHT_SAME_SPOTS],
    # "Мебель и декор": new furniture, the renovation stays
    "furniture_decor": [KEEP_SURFACES, FURNITURE_REPLACE, TEXTILES, DECOR, WALL_DECOR, LIGHT_PLUGIN],
    # "Полностью"
    "almost_everything": [SURFACE, ARCH_DETAILS, FURNITURE_REPLACE, TEXTILES, DECOR, WALL_DECOR, LIGHT_FULL],
}
LEVEL_ALIASES = {"furniture_finishes": "almost_everything"}  # v3 id
LEVEL_ORDER = ["details_only", "finishes_decor", "furniture_decor", "almost_everything"]
DEFAULT_CHANGE_LEVEL = "finishes_decor"
GOAL_MIN_LEVEL = {"full_transform": "almost_everything"}
LEVEL_SUMMARY = {
    "details_only": "only textiles, decor and plug-in lamps change; walls, floor, ceiling and furniture stay exactly as they are",
    "finishes_decor": "walls, floor, ceiling, textiles, decor and the existing light fixtures change; the furniture pieces stay",
    "furniture_decor": "furniture, textiles, decor and plug-in lamps change; walls, floor, ceiling and fixed lights stay exactly as they are",
    "almost_everything": "everything except the architecture, windows, doors and camera angle changes",
}

MAX_REFERENCES = 3


def _section(section_id, title, text, driver):
    return {"id": section_id, "title": title, "text": text.strip(), "driver": driver}


def _join(names):
    if len(names) <= 1:
        return "".join(names)
    return ", ".join(names[:-1]) + " and " + names[-1]


def _reference_count(request):
    if request.get("_noReference"):
        return 0
    refs = request.get("references")
    if isinstance(refs, list) and refs:
        return min(len([r for r in refs if r]), MAX_REFERENCES)
    return 1 if request.get("reference") else 0


def resolve_level(request):
    level = request.get("changeLevel")
    level = LEVEL_ALIASES.get(level, level)
    if level not in CHANGE_LEVELS:
        level = DEFAULT_CHANGE_LEVEL
    driver = "changeLevel"
    min_level = GOAL_MIN_LEVEL.get(request.get("goal"))
    if min_level and LEVEL_ORDER.index(level) < LEVEL_ORDER.index(min_level):
        level, driver = min_level, "changeLevel+goal"
    return level, driver


def build_prompt_plan(request, image_names=None):
    """Return {version, changeLevel, sections, finalPrompt}. image_names = [room_name, ref1_name, ...]."""
    names = list(image_names or [])
    ref_count = _reference_count(request)
    has_ref = ref_count > 0
    room_name = names[0] if names else "ROOM_TO_REDESIGN.jpg"
    ref_names = names[1:1 + MAX_REFERENCES] if len(names) > 1 else [f"STYLE_REFERENCE_{i + 1}.jpg" for i in range(ref_count)]
    many = len(ref_names) > 1
    ref_label = _join(ref_names)
    ref_word = (f"the style references {ref_label}" if many else f"the style reference {ref_label}") if has_ref else "the chosen design direction"
    ref_short = ("the style references" if many else "the style reference") if has_ref else "the chosen design direction"
    goal_id = request.get("goal")
    style_id = request.get("style")
    color_id = request.get("color")

    level, level_driver = resolve_level(request)
    sections = []

    # 1. image roles + hard camera lock (owner's opening lines, image names written out)
    if has_ref:
        style_from = (f"Apply the image style to it from {ref_label}: two or more different references of one style family, "
                      "blend their design language, do not follow any single one"
                      if many else f"Apply the image style to it {ref_label}")
        opening = (f"Style the first image {room_name}. Maintain the angle and position of the camera!!! "
                   f"(((you cannot change the camera angle and the angle of the original image!)))\n{style_from}.\n"
                   f"{room_name} is the only source of the room, its geometry and the camera; "
                   f"{'the other images are' if many else 'the other image is'} only style inspiration.")
    else:
        opening = (f"Redesign the first image {room_name}. Maintain the angle and position of the camera!!! "
                   f"(((you cannot change the camera angle and the angle of the original image!)))")
    sections.append(_section("images_camera", "Images and camera lock", opening, "images"))

    # 2. geometry lock (owner's paragraph)
    if level in ("furniture_decor", "almost_everything"):
        geometry_tail = ("Every wall, window and floor section is in its exact position with its exact original form and scale; "
                         "every piece of furniture keeps its exact position, footprint, orientation and scale.")
    else:
        geometry_tail = "Every wall, window, floor section, and piece of furniture is in its exact position and has its exact original form and scale."
    sections.append(_section("geometry", "Geometry preservation", (
        "A photorealistic, highly detailed image of an interior scene, with the precise perspective, geometric arrangement, "
        f"and layout of every object and architectural feature identically matching the primary provided layout image {room_name}. "
        + geometry_tail
    ), "always"))

    # 3. scope contract: what may change and what must stay
    sections.append(_section("scope", "What changes", (
        f"Scope of this redesign: {LEVEL_SUMMARY[level]}. Everything that is allowed to change must change decisively, at full "
        f"strength, taking as much as possible from {ref_short}; everything that must stay is left untouched."
    ), level_driver))

    # 4. goal: decides the direction; the reference only gives the style vocabulary
    goal = GOAL_BLOCKS.get(goal_id)
    if goal:
        if goal_id == "add_color" and color_id in COLOR_NAMES:
            goal = goal.replace("choose one main accent colour plus one supporting shade that suit the style",
                                f"the main accent colour is {COLOR_NAMES[color_id]} (chosen by the client), plus one supporting "
                                "shade that suits it and the style")
        sections.append(_section("goal", "Design goal (priority)", (
            f"Main design goal (it sets the mood within the scope above; the design language - furniture and lighting forms, "
            f"decor composition and material combinations - comes from {ref_short}): {goal.replace('the style references', ref_short)}"
        ), "goal"))

    # 5. style integration + change-level items
    if has_ref:
        intro = ("While strictly maintaining this spatial structure, the scene is reimagined in the design language "
                 f"of {ref_word}: {'their' if many else 'its'} mood, colour palette, material families, contemporary silhouettes, textures and quality of light. "
                 f"Use {ref_short} as a designer reference: borrow {'their' if many else 'its'} contemporary design techniques, sculptural forms and high-end styling sensibility, "
                 f"while never copying {'their' if many else 'its'} room layout, wall geometry, windows or camera angle. Work like an interior designer who studied {ref_short} and now "
                 "designs a new, original interior tailored to this exact room. This stylistic integration includes:")
    else:
        intro = ("While strictly maintaining this spatial structure, the scene is reimagined in the design direction described here, "
                 "like an interior designer creating a new, original interior for this exact room. This stylistic integration includes:")
    items = list(CHANGE_LEVELS[level])
    if has_ref:
        items = [item + LIGHT_NO_COPY if item.startswith("Lighting:") else item for item in items]
    else:
        for clause in (", not copies of any piece shown in REF", " (new patterns and shapes, not copies)"):
            items = [item.replace(clause, "") for item in items]
    items = [item.replace("REF", ref_short) for item in items]
    if level == "details_only" and style_id == "contemporary_classic":
        items = [item.replace("Hung objects only: no mouldings, no repainting, no wallpaper.",
                              "Besides hung objects, only thin applied picture-frame mouldings are allowed; no repainting, no wallpaper.")
                 for item in items]
    if level != "details_only" and (style_id in HANDLELESS_STYLES or goal_id in HANDLELESS_GOALS):
        items.append(HANDLELESS_LINE)
    if level != "details_only" and style_id in ("organic_modern", "quiet_luxury", "minimalism", "scandinavian", "mediterranean"):
        items.append(MODERN_WALLS_LINE)
    sections.append(_section("style_integration", "Style integration", intro + "\n" + "\n".join(items), level_driver))

    # 6. originality (anti-copy) - only meaningful when a reference is attached
    if has_ref:
        sections.append(_section("originality", "Originality", (
            f"Originality (mandatory): do not transplant the architectural wall layout, window/door positions or exact 1:1 wall compositions from {ref_short}. "
            f"Adapt the contemporary furniture forms, lighting aesthetics, material textures and curatorial styling of {ref_short} into new, original pieces proportioned for {room_name}. "
            "Never hang a cluster or grid of multiple small framed pictures on the wall."
        ), "always"))

    # 7. closing (owner's final paragraph)
    closing = ("The final image is a perfect photographic copy of the layout image, transformed within the scope above into a new, "
               f"original interior that clearly belongs to the same style family as {ref_short}, resulting in a seamless and "
               "sophisticated fusion.")
    sections.append(_section("closing", "Final result", closing, level_driver))

    # 8. style / palette / room / variation
    style = STYLE_HINTS.get(style_id)
    if style:
        if level == "details_only" and style_id == "contemporary_classic":
            style += (" Within this decor-only scope thin applied picture-frame wall mouldings in the wall colour are allowed as "
                      "the only wall change; express the rest of the style through decor, textiles, wall art, mirrors and lamps. "
                      "Do not change the floor and do not reupholster furniture.")
        elif level == "details_only":
            style += (" Within this decor-only scope express the style only through decor, textiles, wall art, mirrors and "
                      "lamps; do not add mouldings, do not change the floor and do not reupholster furniture.")
        sections.append(_section("style", "Style direction", f"Style direction: {style}", "style"))
    palette = PALETTE_BLOCKS.get(color_id)
    if palette:
        if level == "details_only":
            palette = palette.replace("upholstery and textiles", "textiles, art and decor objects").replace(
                "(bench, throw, cushions, bedding or curtains)", "(cushions, throw, curtains, rug, artwork, vases)")
        sections.append(_section("palette", "Palette", palette, "color"))
    room = ROOM_NAMES.get(request.get("room"))
    room_text = (f"The photo shows part of a {room}. " if room else "") + (
        "Style only what is actually visible in the photo: never add a kitchen, cabinetry, worktops, a sink, appliances or "
        "any furniture zone that is not already there, and never remove existing pieces of furniture.")
    sections.append(_section("room", "Room type", room_text, "room"))
    variation = VARIATION_BLOCKS.get(request.get("variation"))
    if variation:
        sections.append(_section("variation", "Variation", variation, "variation"))

    # 9. client wishes
    wishes = str(request.get("specialRequests") or "").strip()
    if wishes:
        sections.append(_section("client_wishes", "Client wishes", (
            f"Client requirements (mandatory, follow them exactly; they override style choices): {wishes}"
        ), "comment"))

    # 10. restrictions
    sections.append(_section("restrictions", "Restrictions", (
        "You cannot add windows or structural elements if they are not present in the original. "
        "Do not change the camera angle, framing, crop or aspect ratio of the first image. Photorealistic result with a neutral "
        "daylight white balance: no yellow, orange or amber colour cast, no sepia, no oversaturation, no HDR look. "
        "No people, text, logos or watermarks."
    ), "always"))

    return {
        "version": PROMPT_VERSION,
        "changeLevel": level,
        "sections": sections,
        "finalPrompt": "\n\n".join(section["text"] for section in sections),
    }


def build_prompt(request, image_names=None):
    return build_prompt_plan(request, image_names)["finalPrompt"]
