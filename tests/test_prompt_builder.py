import unittest

from visual_studio_backend.prompt_builder import build_prompt_plan


class PromptBuilderTests(unittest.TestCase):
    def setUp(self):
        self.request = {
            "room": "living_room",
            "goal": "cozier",
            "style": "organic_modern",
            "color": "beige",
            "changeLevel": "finishes_decor",
            "references": [{"id": "a"}, {"id": "b"}],
            "specialRequests": "Сохранить диван, не менять пол.",
        }

    def plan(self, **overrides):
        return build_prompt_plan({**self.request, **overrides})

    def test_plan_is_ordered_and_composable(self):
        plan = self.plan()
        ids = [section["id"] for section in plan["sections"]]
        self.assertEqual(plan["version"], "lav-master-v4")
        self.assertEqual(ids[0], "images_camera")
        self.assertLess(ids.index("scope"), ids.index("goal"))
        self.assertLess(ids.index("goal"), ids.index("style_integration"))
        self.assertEqual(ids[-1], "restrictions")
        self.assertEqual(plan["finalPrompt"], "\n\n".join(section["text"] for section in plan["sections"]))

    def test_image_names_and_two_references(self):
        prompt = self.plan()["finalPrompt"]
        self.assertIn("ROOM_TO_REDESIGN.jpg", prompt)
        self.assertIn("STYLE_REFERENCE_1.jpg and STYLE_REFERENCE_2.jpg", prompt)
        self.assertIn("blend their design language", prompt)
        self.assertIn("Originality (mandatory)", prompt)
        self.assertIn("Сохранить диван", prompt)

    def test_finishes_decor_keeps_furniture_and_removes_wallpaper(self):
        prompt = self.plan()["finalPrompt"]
        self.assertIn("wallpaper and old wall finish are completely removed", prompt)
        self.assertIn("no new cabinets, wardrobes, dressers", prompt)
        self.assertIn("in exactly the same spots", prompt)
        self.assertIn("Never use the same fixture models", prompt)

    def test_decor_only_and_furniture_decor_keep_surfaces_and_ceiling_light(self):
        for level in ("details_only", "furniture_decor"):
            prompt = self.plan(changeLevel=level)["finalPrompt"]
            self.assertIn("Surfaces Preserved", prompt)
            self.assertIn("no new ceiling or wall-wired fixtures", prompt)
            self.assertIn("Decor and Styling at full strength", prompt)
        self.assertIn("Furniture Redesign", self.plan(changeLevel="furniture_decor")["finalPrompt"])
        self.assertIn("Furniture Preserved", self.plan(changeLevel="details_only")["finalPrompt"])

    def test_full_transform_and_legacy_level(self):
        self.assertEqual(self.plan(goal="full_transform")["changeLevel"], "almost_everything")
        self.assertEqual(self.plan(changeLevel="furniture_finishes")["changeLevel"], "almost_everything")
        self.assertIn("Pendants only above", self.plan(changeLevel="almost_everything")["finalPrompt"])

    def test_handleless_only_for_modern_styles(self):
        self.assertIn("no visible handles", self.plan()["finalPrompt"])  # organic modern
        self.assertNotIn("no visible handles", self.plan(style="contemporary_classic")["finalPrompt"])
        self.assertIn("no visible handles", self.plan(style=None, goal="more_modern")["finalPrompt"])
        self.assertNotIn("no visible handles", self.plan(changeLevel="details_only")["finalPrompt"])

    def test_add_color_uses_chosen_colour(self):
        prompt = self.plan(goal="add_color", color="blue")["finalPrompt"]
        self.assertIn("main accent colour is blue (chosen by the client)", prompt)

    def test_variation_and_no_reference(self):
        plan = build_prompt_plan({**self.request, "references": None, "variation": "bolder", "specialRequests": None})
        ids = [section["id"] for section in plan["sections"]]
        self.assertIn("variation", ids)
        self.assertNotIn("client_wishes", ids)
        self.assertNotIn("originality", ids)
        self.assertIn("the chosen design direction", plan["finalPrompt"])


if __name__ == "__main__":
    unittest.main()
