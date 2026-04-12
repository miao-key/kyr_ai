from dataclasses import dataclass
import json
import sys

@dataclass
class RectAndField:
    rect: list
    rect_type: str
    field: dict

def rects_intersect(r1, r2):
    disjoint_horizontal = r1[0] >= r2[2] or r1[2] <= r2[0]
    disjoint_vertical = r1[1] >= r2[3] or r1[3] <= r2[1]
    return not (disjoint_horizontal or disjoint_vertical)

def get_bounding_box_messages(fields_json_stream):
    messages = []
    fields = json.load(fields_json_stream)
    messages.append(f"Read {len(fields["form_fields"])} fields")
    rects_and_fields = []
    for f in fields["form_fields"]:
        rects_and_fields.append(RectAndField(f["label_bounding_box"], "label", f))
        rects_and_fields.append(RectAndField(f["entry_bounding_box"], "entry", f))
    has_error = False
    for i, ri in enumerate(rects_and_fields):
        for j in range(i + 1, len(rects_and_fields)):
            rj = rects_and_fields[j]
            if ri.field["page_number"] == rj.field["page_number"] and rects_intersect(ri.rect, rj.rect):
                has_error = True
                if ri.field is rj.field:
                    messages.append(f"FAILURE: intersection for `{ri.field["description"]}`")
                else:
                    messages.append(f"FAILURE: intersection between {ri.rect_type} for `{ri.field["description"]}` and {rj.rect_type} for `{rj.field["description"]}`")
        if len(messages) >= 20:
            messages.append("Aborting further checks; fix bounding boxes and try again")
            return messages
        if ri.rect_type == "entry":
            if "entry_text" in ri.field:
                font_size = ri.field["entry_text"].get("font_size", 14)
                entry_height = ri.rect[3] - ri.rect[1]
                if entry_height < font_size:
                    has_error = True
                    messages.append(f"FAILURE: entry box height ({entry_height}) too short for font size {font_size}")
        if len(messages) >= 20:
            messages.append("Aborting further checks; fix bounding boxes and try again")
            return messages
    if not has_error:
        messages.append("SUCCESS: All bounding boxes are valid")
    return messages

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: check_bounding_boxes.py [fields.json]")
        sys.exit(1)
    with open(sys.argv[1]) as f:
        messages = get_bounding_box_messages(f)
    for msg in messages:
        print(msg)