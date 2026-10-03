# בדיקת CSV שינויי שמות: Banko/Banka/Hirsch מול Yarkoni

## קובץ והיקף

נבדק הקובץ המקומי `קובץ המקור שנבדק`, בלי לשנותו. גודל הקובץ 2,419,797 בתים; זמן שינוי 2026-10-02 21:31 IDT. הקובץ כולל 19,043 רשומות נתונים (19,044 שורות כולל כותרת), כולן עם מזהה שורה ייחודי. טווח `gazette_date` הוא 1921-10-15 עד 1947-12-18. מספר הרשומות אינו מספר אנשים: אותה הודעת שינוי שם יכולה לכלול שורה נפרדת לכל בן משפחה, ונתוני מקור חלקיים עשויים להופיע ביותר מסריקה אחת.

כותרות השדות: `id`, `gazette_date`, `old_surname`, `old_given_names`, `new_surname`, `new_given_names`, `address`, `city`, `nationality`, `hebraization`, `change_type`, `source`. חיפשתי את כל הרשומות, בכל ארבעת שדות השמות, ללא תלות באיות אותיות גדולות/קטנות. בדקתי `Banko`, `Banka`, `Bajnka`, `Bajnko` וגם איותים עבריים של בנקו; `Hirsh`, `Hersz`, `Hirsch` והירש; וכן `Yarkoni`, `Yarkony`, `Jarkoni`, `Jarkony` וירקוני. בשדות השמות לא מופיעות אותיות עבריות כלל.

## תוצאה ישירה

- **אין** בקובץ התאמה באחד משמות Banko/Banka/Bajnka, באף אחד משדות השמות.
- יש שמות המכילים מחרוזת רחבה `Bank`, אך אלה `Bankwecer`, `Sandbank` ו־`Milenbank`, ולא Banko/Banka/Bajnka. אין ביניהם שורת Yarkoni או Hirsch/Hersz/Hirsh.
- **אין** שורה אחת שמכילה גם אחד משמות Banko/Banka/Bajnka וגם Hirsch/Hersz/Hirsh או Yarkoni.
- **אין** שורה עם Yarkoni/Yarkony/Jarkoni/Jarkony יחד עם Hirsch/Hersz/Hirsh, בין בשם הקודם ובין בשם החדש.
- חיפוש `Hirsch/Hersz/Hirsh` לבדו מצא 197 שורות, אך אף אחת אינה קשורה לשורת Yarkoni או Banko/Banka/Bajnka. לא נרמזה זהות לפי דמיון בשם בלבד.

## רשומות `Bank` הרחבות שנבדקו ונפסלו

| ID | תאריך | שם קודם → חדש | מקום | מקור בשדה `source` |
|---|---|---|---|---|
| 15771 | 1930-06-16 | Bankwecer, Jeszyia → Benaryeh, Yehoshua | Tiberias | `m-7132-29.pdf p.484` |
| 15772 | 1930-06-16 | Bankwecer, Reizel → Benaryeh, Shoshana | Tiberias | `m-7132-29.pdf p.484` |
| 17525 | 1930-06-16 | Bankwecer, Jesyia → Benaryeh, Yehoshua | Tiberias | `m-7141-3.pdf p.749` |
| 17562 | 1930-06-16 | Sandbank, Ber → Sandbank-Zucker, Dov | Tel Aviv | `m-7141-3.pdf p.751` |
| 18649 | 1923-04-15 | Milenbank, Chaim → Zwiely, Chaim | Tel Aviv | `downloads-7141-1.pdf p.463` |
| 18650 | 1923-04-15 | Milenbank, Gila → Zwiely, Gila | Tel Aviv | `downloads-7141-1.pdf p.463` |

אלה שמות שונים, בערים שונות, ואין בהם בסיס לקישור למשפחה המבוקשת.

## Yarkoni/Yarkony: רשומות דומות, לא התאמה

מצאתי 30 שורות שבהן שם קודם או חדש מכיל Yarkoni/Yarkony/Jarkoni. הן מסתדרות בשמונה הודעות/קבוצות מקור, ולא כוללות Banko/Banka/Bajnka או Hirsch/Hersz/Hirsh:

| תאריך | שם קודם → שם חדש | מקום | מקור בשדה `source` | הערה |
|---|---|---|---|---|
| 1922-05-01 | Greengard → Yarkony (Joseph) | Haifa | `downloads-7141-1.pdf p.354` | שם פרטי Joseph; אין Hirsch/Banko |
| 1930-03-01 | Grinberg → Yarkony (Pinhas) | Tel Aviv | `m-7132-29.pdf p.162` | אין Hirsch/Banko |
| 1935-01-24 | Grunspun-Fleissig → Yarkoni (Emanuel, Chawa, Pirhia) | Givat Hashlosha | `m-7123-1.pdf p.450`; גם `m-7142-1.pdf p.76` עם פיצול שם משפחה | שתי גרסאות סריקה/פיצול; אין מועמד בנקו |
| 1937-09-30 | Grünfeld → Yarkony (Yishai, No'omi, Dan) | Maabarot | `m-7122-5.pdf p.301` | בשורת Yishai השדה `old_given_names` הוא Yarkony; אין Hirsch/Banko |
| 1937-12-30 | Zelione → Yarkoni (Mordechai, Sarah, Sima, Pinhas, Dan) | Jerusalem | `m-7122-5.pdf p.697` | אין Hirsch/Banko |
| 1944-08-24 | Zielieniewski / Zielniewski → Yarkoni (ארבעה שמות בכל גרסה) | Haifa | `m-7121-2.pdf p.189`; גם `m-7133-3.pdf p.189` | שתי גרסאות המקור אינן זהות בכל שמות הפרט, אך בשתיהן אין Banko/Hirsch |
| 1944-10-12 | Grinbarg → Yarkoni (Golda) | M.E.F. | `m-7121-2.pdf p.367`; גם `m-7133-3.pdf p.367` | שתי גרסאות מקור; אין Banko/Hirsch |
| 1947-04-17 | Zielonka → Yarkoni (Judka Arja, Chawa Eidle, Zina, Navah) | Haifa | `m-7126-4.pdf p.414` | אין Hirsch/Banko |

הטבלה מתארת מחרוזות דומות לצורך שלילת מועמד, לא קשר משפחתי. לא נמצא בה צבי/צבי הירש/הירש בנקו. אין התאמת שם ועיר לעפולה.

## משמעות ומגבלות

בתוך הכיסוי של ה־CSV הזה, התוצאה שלילית: הוא אינו מתעד שינוי שם Banko/Banka/Bajnka ל־Yarkoni, ואינו מקשר שם הירש/הירש עם ירקוני. זו אינה הוכחה שלא היה שינוי שם. הכיסוי המוצהר בקובץ מתחיל ב־1921 ומסתיים ב־1947; רישום עשוי להיות חסר, מתועתק אחרת, או לא להופיע במאגר. אין בקובץ שדה הורים, תאריך לידה או קישור לרשומת נישואין, ולכן אפילו התאמת שם לבדה לא הייתה מספיקה לזיהוי האדם.
