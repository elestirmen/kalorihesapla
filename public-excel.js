function createPublicMenuWorkbook(XLSX, menu) {
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: 'Haftalık Yemek Menüsü',
    Subject: menu.label || menu.weekId,
    Author: 'Kalori Hesapla'
  };

  const colors = {
    dark: '332A1D',
    accent: 'D97016',
    accentSoft: 'F7E2CE',
    cream: 'FCF6EE',
    line: 'DCCDBE',
    white: 'FFFFFF',
    danger: '9F2D28',
    dangerBg: 'FDE8E7',
    possibleBg: 'FFF0DA',
    possibleText: 'A85800',
    mayBg: 'FFF7D6',
    mayText: '755B00',
    unknownBg: 'ECEFF1',
    unknownText: '59636B'
  };
  const border = {
    top: { style: 'thin', color: { rgb: colors.line } },
    bottom: { style: 'thin', color: { rgb: colors.line } },
    left: { style: 'thin', color: { rgb: colors.line } },
    right: { style: 'thin', color: { rgb: colors.line } }
  };
  const styles = {
    mobileHeader: {
      font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: '000000' } },
      fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    },
    mobileDate: {
      font: { name: 'Calibri', sz: 11, color: { rgb: '000000' } },
      fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    },
    mobileDay: {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
      fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    },
    mobileFood: {
      font: { name: 'Calibri', sz: 11, color: { rgb: '000000' } },
      fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    },
    mobileKcal: {
      font: { name: 'Calibri', sz: 11, color: { rgb: '000000' } },
      fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      },
      numFmt: '0'
    },
    mobileTotal: {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
      fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    },
    header: {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: colors.white } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.dark } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border
    },
    allergenHeader: {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: colors.white } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.danger } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border
    },
    day: {
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: colors.dark } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.accentSoft } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border
    },
    food: {
      font: { name: 'Calibri', sz: 10, color: { rgb: colors.dark } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.white } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border
    },
    kcal: {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: colors.accent } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.white } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border,
      numFmt: '0 "kcal"'
    },
    total: {
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: colors.dark } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.cream } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border
    },
    allergenNone: {
      font: { name: 'Calibri', sz: 9, color: { rgb: colors.dark } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.white } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border
    },
    allergenContains: {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: colors.danger } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.dangerBg } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border
    },
    allergenPossible: {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: colors.possibleText } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.possibleBg } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border
    },
    allergenMay: {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: colors.mayText } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.mayBg } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border
    },
    allergenUnknown: {
      font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: colors.unknownText } },
      fill: { patternType: 'solid', fgColor: { rgb: colors.unknownBg } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border
    }
  };

  const cell = (value, style = styles.food) => ({
    v: value,
    t: typeof value === 'number' ? 'n' : 's',
    s: style
  });
  const blank = style => cell('', style);
  const formatDate = value => {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${Number(match[3])}.${Number(match[2])}.${match[1]}` : String(value || '');
  };
  const allergenText = item => {
    const info = item?.allergens;
    if (!info) return '';
    const parts = [];
    const names = entries => entries.map(entry => entry.shortName || entry.name).join(', ');
    if (info.contains?.length) parts.push(`İÇERİR: ${names(info.contains)}`);
    if (info.possibleContains?.length) parts.push(`OLABİLİR: ${names(info.possibleContains)}`);
    if (info.mayContain?.length) parts.push(`ÇAPRAZ TEMAS: ${names(info.mayContain)}`);
    if (info.status === 'unknown') parts.push('BİLGİ DOĞRULANMAMIŞ');
    return parts.join(' · ');
  };
  const allergenStyle = item => {
    const info = item?.allergens;
    if (info?.contains?.length) return styles.allergenContains;
    if (info?.possibleContains?.length) return styles.allergenPossible;
    if (info?.mayContain?.length) return styles.allergenMay;
    if (info?.status === 'unknown') return styles.allergenUnknown;
    return styles.allergenNone;
  };
  const itemName = item => item
    ? `${item.name}${item.portionMultiplier !== 1 ? ` (${String(item.portionMultiplier).replace('.', ',')}x)` : ''}`
    : '';

  const mobileRows = [[
    cell('TARİH', styles.mobileHeader),
    cell('GÜN', styles.mobileHeader),
    cell('ÖĞLE', styles.mobileHeader),
    cell('kalori', styles.mobileHeader),
    cell('alerjen', styles.mobileHeader),
    cell('AKŞAM', styles.mobileHeader),
    cell('kalori', styles.mobileHeader),
    cell('alerjen', styles.mobileHeader)
  ]];
  const mobileMerges = [];

  menu.days.forEach(day => {
    const lunch = day.meals.lunch.items;
    const dinner = day.meals.dinner.items;
    const itemRowCount = Math.max(lunch.length, dinner.length, 1);
    const firstRow = mobileRows.length;

    for (let index = 0; index < itemRowCount; index += 1) {
      const lunchItem = lunch[index];
      const dinnerItem = dinner[index];
      mobileRows.push([
        cell(index === 0 ? formatDate(day.date) : '', styles.mobileDate),
        cell(index === 0 ? String(day.dayName || '').toLocaleUpperCase('tr-TR') : '', styles.mobileDay),
        cell(itemName(lunchItem), styles.mobileFood),
        cell(lunchItem?.calories || 0, styles.mobileKcal),
        cell(allergenText(lunchItem), styles.mobileFood),
        cell(itemName(dinnerItem), styles.mobileFood),
        cell(dinnerItem?.calories || 0, styles.mobileKcal),
        cell(allergenText(dinnerItem), styles.mobileFood)
      ]);
    }

    mobileRows.push([
      blank(styles.mobileDate),
      blank(styles.mobileDay),
      cell(`TOPLAM: ${day.meals.lunch.totalCalories} kcal`, styles.mobileTotal),
      cell(day.meals.lunch.totalCalories, styles.mobileKcal),
      blank(styles.mobileFood),
      cell(`TOPLAM: ${day.meals.dinner.totalCalories} kcal`, styles.mobileTotal),
      cell(day.meals.dinner.totalCalories, styles.mobileKcal),
      blank(styles.mobileFood)
    ]);
    const lastRow = mobileRows.length - 1;
    mobileMerges.push(
      { s: { r: firstRow, c: 0 }, e: { r: lastRow, c: 0 } },
      { s: { r: firstRow, c: 1 }, e: { r: lastRow, c: 1 } }
    );
  });

  const mobileSheet = XLSX.utils.aoa_to_sheet(mobileRows);
  mobileSheet['!cols'] = [
    { wch: 14 }, { wch: 16 }, { wch: 32 }, { wch: 11 },
    { wch: 32 }, { wch: 32 }, { wch: 11 }, { wch: 32 }
  ];
  mobileSheet['!rows'] = mobileRows.map((row, index) => ({ hpt: index === 0 ? 28 : 23 }));
  mobileSheet['!merges'] = mobileMerges;

  const planRows = [[
    cell('GÜN / TARİH', styles.header),
    cell('ÖĞLE MENÜSÜ', styles.header),
    cell('Öğle Alerjen Uyarısı', styles.allergenHeader),
    cell('AKŞAM MENÜSÜ', styles.header),
    cell('Akşam Alerjen Uyarısı', styles.allergenHeader),
    cell('GÜNLÜK TOPLAM', styles.header)
  ]];
  menu.days.forEach(day => {
    const describeMeal = meal => [
      ...meal.items.map((item, index) => `${index + 1}. ${itemName(item)} · ${item.calories} kcal`),
      `Öğün toplamı: ${meal.totalCalories} kcal`
    ].join('\n');
    const describeAllergens = meal => meal.items
      .filter(item => allergenText(item))
      .map(item => `${item.name}: ${allergenText(item)}`)
      .join('\n') || 'Kayıtlı profilde uyarı yok';
    planRows.push([
      cell(`${String(day.dayName || '').toLocaleUpperCase('tr-TR')}\n${formatDate(day.date)}`, styles.day),
      cell(describeMeal(day.meals.lunch)),
      cell(describeAllergens(day.meals.lunch), allergenStyle(day.meals.lunch.items.find(item => allergenText(item)))),
      cell(describeMeal(day.meals.dinner)),
      cell(describeAllergens(day.meals.dinner), allergenStyle(day.meals.dinner.items.find(item => allergenText(item)))),
      cell(day.totalCalories, styles.kcal)
    ]);
  });
  const planSheet = XLSX.utils.aoa_to_sheet(planRows);
  planSheet['!cols'] = [
    { wch: 17 }, { wch: 38 }, { wch: 34 }, { wch: 38 }, { wch: 34 }, { wch: 16 }
  ];
  planSheet['!rows'] = planRows.map((row, index) => ({ hpt: index === 0 ? 28 : 72 }));

  const allergenRows = [[
    cell('Gün', styles.header),
    cell('Tarih', styles.header),
    cell('Öğün', styles.header),
    cell('Yemek', styles.header),
    cell('Porsiyon', styles.header),
    cell('İÇERİR', styles.allergenHeader),
    cell('TARİFE GÖRE BULUNABİLİR', styles.allergenHeader),
    cell('ÇAPRAZ TEMAS', styles.allergenHeader),
    cell('BİLGİ DURUMU', styles.allergenHeader),
    cell('NOT', styles.allergenHeader)
  ]];
  const detailRows = [[
    cell('Gün', styles.header), cell('Tarih', styles.header), cell('Öğün', styles.header),
    cell('1. Yemek', styles.header), cell('kcal', styles.header),
    cell('2. Yemek', styles.header), cell('kcal', styles.header),
    cell('3. Yemek', styles.header), cell('kcal', styles.header),
    cell('4. Yemek', styles.header), cell('kcal', styles.header),
    cell('Öğün toplamı', styles.header), cell('ALERJEN UYARISI / BİLGİSİ', styles.allergenHeader)
  ]];

  menu.days.forEach(day => {
    [['Öğle', day.meals.lunch], ['Akşam', day.meals.dinner]].forEach(([mealName, meal]) => {
      meal.items.forEach(item => {
        const names = entries => entries?.map(entry => entry.name).join(', ') || '';
        allergenRows.push([
          cell(day.dayName), cell(formatDate(day.date)), cell(mealName), cell(itemName(item)),
          cell(`${item.portionMultiplier}x`),
          cell(names(item.allergens.contains), allergenStyle(item)),
          cell(names(item.allergens.possibleContains), allergenStyle(item)),
          cell(names(item.allergens.mayContain), allergenStyle(item)),
          cell(item.allergens.statusLabel, allergenStyle(item)),
          cell(item.allergens.note || '', allergenStyle(item))
        ]);
      });
      const detailRow = [cell(day.dayName), cell(formatDate(day.date)), cell(mealName)];
      for (let index = 0; index < 4; index += 1) {
        const item = meal.items[index];
        detailRow.push(cell(itemName(item) || '-'), cell(item?.calories || 0, styles.kcal));
      }
      detailRow.push(
        cell(meal.totalCalories, styles.kcal),
        cell(meal.items.map(item => `${item.name}: ${allergenText(item)}`).filter(text => !text.endsWith(': ')).join('\n'), styles.allergenNone)
      );
      detailRows.push(detailRow);
    });
  });

  const allergenSheet = XLSX.utils.aoa_to_sheet(allergenRows);
  allergenSheet['!cols'] = [
    { wch: 13 }, { wch: 14 }, { wch: 10 }, { wch: 28 }, { wch: 10 },
    { wch: 28 }, { wch: 30 }, { wch: 26 }, { wch: 24 }, { wch: 36 }
  ];
  allergenSheet['!autofilter'] = { ref: `A1:J${allergenRows.length}` };

  const detailSheet = XLSX.utils.aoa_to_sheet(detailRows);
  detailSheet['!cols'] = [
    { wch: 13 }, { wch: 14 }, { wch: 10 },
    { wch: 25 }, { wch: 10 }, { wch: 25 }, { wch: 10 },
    { wch: 25 }, { wch: 10 }, { wch: 25 }, { wch: 10 },
    { wch: 14 }, { wch: 50 }
  ];
  detailSheet['!autofilter'] = { ref: `A1:M${detailRows.length}` };

  XLSX.utils.book_append_sheet(workbook, mobileSheet, 'Mobil');
  XLSX.utils.book_append_sheet(workbook, planSheet, 'Plan');
  XLSX.utils.book_append_sheet(workbook, allergenSheet, 'Alerjenler');
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detay');
  workbook.Workbook = workbook.Workbook || {};
  workbook.Workbook.Names = [
    { Name: '_xlnm.Print_Area', Sheet: 0, Ref: `'Mobil'!$A$1:$H$${mobileRows.length}` },
    { Name: '_xlnm.Print_Area', Sheet: 1, Ref: `'Plan'!$A$1:$F$${planRows.length}` }
  ];
  return workbook;
}

module.exports = { createPublicMenuWorkbook };
