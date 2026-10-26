# カステラのイラスト制作記録 — 2026-10-26

- 保存先: dist/assets/castella-anime.png
- 方法: OpenAIの組み込み imagegen。1254×1254、RGBA、透明背景。
- 参照1: 既存の3匹のイラスト cat-trio-anime.png。絵柄・頭身・スカーフの描き方を合わせるために使用。
- 参照2: ユーザー提供の カステラ.png。毛柄、猫自身の左耳の欠け、短い尻尾の特徴を参照。元画像は変更していません。
- 新画像はゲームの4匹目の選択、タイトル横、開始画面に使用。単一のindex.htmlにも埋め込んでいます。
- 3Dモデルはプログラムで作成し、左耳は実際の形を欠けさせ、尻尾の曲線長は既存猫の約51%にしています。

## 使用したプロンプト

```
Asset type: transparent game character portrait. Reference 1 (the three scarf-wearing kittens) is the exact target style, proportions, rendering quality and presentation. Reference 2 (the Castella character sheet) provides Castella's identity, markings and anatomy only; the lettering and diagram layout are NOT to be reproduced. Create ONE new full-body seated chibi anime kitten, Castella, matching the three existing kittens as a fourth playable character. Large friendly green-gold eyes, round head, soft detailed fur, little white paws, white chest and white muzzle, pink nose. Preserve the muted brown-gray tabby/calico coat with irregular pale caramel patches across the forehead and sides shown in Castella's reference. Gentle affectionate expression with a small mischievous smile; sweet but tomboyish, no aggression. Add a pastel lavender neckerchief in the same tied scarf design as the other three cats. Essential identifying details: the CAT'S OWN LEFT EAR, which is on the VIEWER'S RIGHT in this front/three-quarter view, has a clearly visible small missing section/clipped notched tip, healed, no wound. The opposite ear is intact. Tail is visibly only HALF the usual length of the other cats' tails, with a natural blunt rounded furry end, clearly visible beside the body; not a full long curled tail and not an entirely tailless cat. Front-facing with a very slight three-quarter turn, all four paws and the whole shortened tail inside the frame. Center the single kitten on a square canvas with modest transparent padding, no props. Crisp readable silhouette, warm soft cel shading, ivory highlights, identical cute illustrated anime aesthetic to reference 1. Genuine alpha transparency, no opaque background or checkerboard, no text, labels, watermarks, borders, character-sheet panels, other cats or photographs.
```
