const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

// Translated descriptions for sample menu items
const translatedDescriptions = {
  'Wagyu Beef Burger': {
    en: 'Premium Wagyu beef patty, truffle aioli, caramelized onions, aged cheddar, arugula on brioche bun.',
    fr: 'Galette de bœuf Wagyu premium, aïoli à la truffe, oignons caramélisés, cheddar affiné, roquette sur pain brioché.',
    es: 'Hamburguesa de carne Wagyu premium, alioli de trufa, cebollas caramelizadas, queso cheddar añejo, rúcula en pan brioche.',
    ar: 'فطيرة لحم واغيو الفاخر، أيولي الكمأة، بصل مكرمل، جبنة شيدر معتقة، جرجير على خبز البريوش.',
    de: 'Premium Wagyu-Rindfleisch-Patty, Trüffel-Aioli, karamellisierte Zwiebeln, gereifter Cheddar, Rucola auf Brioche-Brötchen.'
  },
  'Neapolitan Margherita Pizza': {
    en: 'Wood-fired pizza with San Marzano tomatoes, buffalo mozzarella, fresh basil, EVOO.',
    fr: 'Pizza au feu de bois avec tomates San Marzano, mozzarella de bufflonne, basilic frais, huile d\'olive extra vierge.',
    es: 'Pizza al horno de leña con tomates San Marzano, mozzarella de búfala, albahaca fresca, aceite de oliva virgen extra.',
    ar: 'بيتزا مخبوزة بالحطب مع طماطم سان مارزانو، موتزاريلا الجاموس، ريحان طازج، زيت زيتون بكر ممتاز.',
    de: 'Holzofenpizza mit San Marzano Tomaten, Büffelmozzarella, frischem Basilikum, nativem Olivenöl extra.'
  },
  'Grilled Atlantic Salmon': {
    en: 'Fresh Atlantic salmon with lemon butter, asparagus, roasted potatoes, dill cream sauce.',
    fr: 'Saumon de l\'Atlantique frais au beurre citronné, asperges, pommes de terre rôties, sauce crémeuse à l\'aneth.',
    es: 'Salmón del Atlántico fresco con mantequilla de limón, espárragos, papas asadas, salsa de crema de eneldo.',
    ar: 'سلمون أطلسي طازج مع زبدة الليمون، هليون، بطاطس مشوية، صلصة كريمة الشبت.',
    de: 'Frischer Atlantiklachs mit Zitronenbutter, Spargel, Röstkartoffeln, Dill-Sahnesauce.'
  },
  'Truffle Mushroom Risotto': {
    en: 'Creamy arborio rice with porcini mushrooms, white truffle oil, parmesan, fresh herbs.',
    fr: 'Riz arborio crémeux avec champignons porcini, huile de truffe blanche, parmesan, herbes fraîches.',
    es: 'Arroz arborio cremoso con hongos porcini, aceite de trufa blanca, parmesano, hierbas frescas.',
    ar: 'أرز أربوريو كريمي مع فطر بورشيني، زيت الكمأة البيضاء، بارميزان، أعشاب طازجة.',
    de: 'Cremiger Arborio-Reis mit Steinpilzen, weißem Trüffelöl, Parmesan, frischen Kräutern.'
  },
  'Prime Ribeye Steak': {
    en: '12oz USDA Prime ribeye, herb butter, garlic mashed potatoes, grilled vegetables.',
    fr: 'Entrecôte USDA Prime de 340g, beurre aux herbes, purée de pommes de terre à l\'ail, légumes grillés.',
    es: 'Ribeye USDA Prime de 340g, mantequilla de hierbas, puré de papas con ajo, verduras a la parrilla.',
    ar: 'ريب آي USDA بريميوم 340 جرام، زبدة الأعشاب، بطاطس مهروسة بالثوم، خضروات مشوية.',
    de: '340g USDA Prime Ribeye, Kräuterbutter, Knoblauch-Kartoffelpüree, gegrilltes Gemüse.'
  },
  'Lobster Linguine': {
    en: 'Fresh lobster tail, garlic white wine sauce, cherry tomatoes, basil, parmesan.',
    fr: 'Queue de homard frais, sauce ail vin blanc, tomates cerises, basilic, parmesan.',
    es: 'Cola de langosta fresca, salsa de ajo y vino blanco, tomates cherry, albahaca, parmesano.',
    ar: 'ذيل جراد البحر الطازج، صلصة الثوم والنبيذ الأبيض، طماطم كرزية، ريحان، بارميزان.',
    de: 'Frischer Hummerschwanz, Knoblauch-Weißweinsauce, Kirschtomaten, Basilikum, Parmesan.'
  },
  'Pan-Seared Duck Breast': {
    en: 'Tender duck breast, cherry reduction, roasted root vegetables, crispy skin.',
    fr: 'Poitrine de canard tendre, réduction de cerises, légumes racines rôtis, peau croustillante.',
    es: 'Pechuga de pato tierna, reducción de cereza, verduras de raíz asadas, piel crujiente.',
    ar: 'صدر بط طري، تتبيلة الكرز، خضروات جذرية مشوية، جلد مقرمش.',
    de: 'Zarte Entenbrust, Kirschreduktion, geröstetes Wurzelgemüse, knusprige Haut.'
  },
  'Sushi Platter Deluxe': {
    en: 'Chef selection: 8 pieces nigiri, 6 pieces sashimi, California roll, wasabi, ginger.',
    fr: 'Sélection du chef: 8 pièces nigiri, 6 pièces sashimi, rouleau California, wasabi, gingembre.',
    es: 'Selección del chef: 8 piezas nigiri, 6 piezas sashimi, rollo California, wasabi, jengibre.',
    ar: 'اختيار الشيف: 8 قطع نيغيري، 6 قطع ساشيمي، لفة كاليفورنيا، واسابي، زنجبيل.',
    de: 'Chef-Auswahl: 8 Stück Nigiri, 6 Stück Sashimi, California Roll, Wasabi, Ingwer.'
  },
  'Crispy Calamari': {
    en: 'Lightly fried calamari rings, marinara sauce, lemon aioli, fresh herbs.',
    fr: 'Anneaux de calamars légèrement frits, sauce marinara, aïoli au citron, herbes fraîches.',
    es: 'Anillos de calamar ligeramente fritos, salsa marinara, alioli de limón, hierbas frescas.',
    ar: 'حلقات الحبار المقلية الخفيفة، صلصة المارينارا، أيولي الليمون، أعشاب طازجة.',
    de: 'Leicht frittierte Calamariringe, Marinara-Sauce, Zitronen-Aioli, frische Kräuter.'
  },
  'Bruschetta Trio': {
    en: 'Toasted crostini with tomato basil, mushroom truffle, and prosciutto toppings.',
    fr: 'Crostini grillés avec tomate basilic, truffe aux champignons et garnitures de prosciutto.',
    es: 'Crostini tostado con tomate albahaca, trufa de champiñones y coberturas de prosciutto.',
    ar: 'كروستيني محمص مع الطماطم والريحان، كمأة الفطر، وطبقة البروشوتو.',
    de: 'Geröstete Crostini mit Tomaten-Basilikum, Pilz-Trüffel und Prosciutto-Belägen.'
  },
  'Shrimp Tempura': {
    en: 'Crispy tempura shrimp, sweet chili sauce, pickled vegetables.',
    fr: 'Crevettes tempura croustillantes, sauce chili douce, légumes marinés.',
    es: 'Camarones tempura crujientes, salsa de chile dulce, verduras en escabeche.',
    ar: 'جمبري تمبورا مقرمش، صلصة الفلفل الحلو، خضروات مخللة.',
    de: 'Knusprige Tempura-Garnelen, süße Chilisauce, eingelegtes Gemüse.'
  },
  'Caprese Salad': {
    en: 'Fresh mozzarella, heirloom tomatoes, basil, balsamic glaze, EVOO.',
    fr: 'Mozzarella fraîche, tomates anciennes, basilic, glaçage balsamique, huile d\'olive extra vierge.',
    es: 'Mozzarella fresca, tomates reliquia, albahaca, glaseado balsámico, aceite de oliva virgen extra.',
    ar: 'موتزاريلا طازجة، طماطم تراثية، ريحان، صقيع البلسميك، زيت زيتون بكر ممتاز.',
    de: 'Frischer Mozzarella, Erbstück-Tomaten, Basilikum, Balsamico-Glasur, natives Olivenöl extra.'
  },
  'French Onion Soup': {
    en: 'Caramelized onions, beef broth, gruyere cheese, crusty bread.',
    fr: 'Oignons caramélisés, bouillon de bœuf, fromage gruyère, pain croustillant.',
    es: 'Cebollas caramelizadas, caldo de res, queso gruyere, pan crujiente.',
    ar: 'بصل مكرمل، مرق اللحم، جبنة غرويير، خبز مقرمش.',
    de: 'Karamellisierte Zwiebeln, Rinderbrühe, Gruyère-Käse, knuspriges Brot.'
  },
  'Fresh Pressed Juices': {
    en: 'Daily selection of cold-pressed organic juices: orange, carrot, green detox.',
    fr: 'Sélection quotidienne de jus bio pressés à froid: orange, carotte, détox vert.',
    es: 'Selección diaria de jugos orgánicos prensados en frío: naranja, zanahoria, detox verde.',
    ar: 'مجموعة يومية من العصائر العضوية المعصورة على البارد: برتقال، جزر، ديتوكس أخضر.',
    de: 'Tägliche Auswahl an kaltgepressten Bio-Säften: Orange, Karotte, grüner Detox.'
  },
  'Specialty Coffee': {
    en: 'Espresso, cappuccino, latte, or flat white with premium arabica beans.',
    fr: 'Espresso, cappuccino, latte ou flat white avec grains arabica premium.',
    es: 'Espresso, capuchino, latte o flat white con granos de arábica premium.',
    ar: 'إسبريسو، كابتشينو، لاتيه، أو فلات وايت مع حبوب أرابيكا الفاخرة.',
    de: 'Espresso, Cappuccino, Latte oder Flat White mit Premium-Arabica-Bohnen.'
  },
  'Tropical Smoothie Bowl': {
    en: 'Mango, pineapple, banana, coconut milk, topped with granola and berries.',
    fr: 'Mangue, ananas, banane, lait de coco, garni de granola et baies.',
    es: 'Mango, piña, plátano, leche de coco, cubierto con granola y frutos rojos.',
    ar: 'مانجو، أناناس، موز، حليب جوز الهند، مغطى بالجرانولا والتوت.',
    de: 'Mango, Ananas, Banane, Kokosmilch, mit Granola und Beeren garniert.'
  },
  'Artisan Iced Tea': {
    en: 'House-brewed iced tea: peach, passion fruit, or green tea with mint.',
    fr: 'Thé glacé maison: pêche, fruit de la passion ou thé vert à la menthe.',
    es: 'Té helado casero: durazno, maracuyá o té verde con menta.',
    ar: 'شاي مثلج محلي: خوخ، فاكهة العاطفة، أو شاي أخضر مع نعناع.',
    de: 'Hausgemachter Eistee: Pfirsich, Passionsfrucht oder grüner Tee mit Minze.'
  },
  'Classic Milkshake': {
    en: 'Vanilla, chocolate, or strawberry with whipped cream and cherry.',
    fr: 'Vanille, chocolat ou fraise avec crème fouettée et cerise.',
    es: 'Vainilla, chocolate o fresa con crema batida y cereza.',
    ar: 'فانيليا، شوكولاتة، أو فراولة مع كريمة مخفوقة وكرز.',
    de: 'Vanille, Schokolade oder Erdbeere mit Schlagsahne und Kirsche.'
  },
  'Molten Chocolate Lava Cake': {
    en: 'Warm chocolate cake with liquid center, vanilla ice cream, raspberry coulis.',
    fr: 'Gâteau au chocolat chaud avec centre liquide, glace vanille, coulis de framboises.',
    es: 'Pastel de chocolate caliente con centro líquido, helado de vainilla, coulis de frambuesa.',
    ar: 'كعكة الشوكولاتة الدافئة مع مركز سائل، آيس كريم الفانيليا، كوليس التوت.',
    de: 'Warmer Schokoladenkuchen mit flüssigem Kern, Vanilleeis, Himbeer-Coulis.'
  },
  'Classic Crème Brûlée': {
    en: 'Silky vanilla custard with caramelized sugar crust, fresh berries.',
    fr: 'Crème anglaise à la vanille soyeuse avec croûte de sucre caramélisé, baies fraîches.',
    es: 'Crema de vainilla sedosa con costra de azúcar caramelizada, frutos rojos frescos.',
    ar: 'كاستارد الفانيليا الحريري مع قشرة السكر المكرملة، توت طازج.',
    de: 'Seidige Vanillecreme mit karamellisierter Zuckerkruste, frische Beeren.'
  },
  'Tiramisu': {
    en: 'Classic Italian dessert with espresso-soaked ladyfingers, mascarpone cream, cocoa dust.',
    fr: 'Dessert italien classique avec biscuits imbibés d\'espresso, crème mascarpone, poudre de cacao.',
    es: 'Postre italiano clásico con bizcochos empapados en espresso, crema de mascarpone, polvo de cacao.',
    ar: 'حلوى إيطالية كلاسيكية مع بسكويت منقوع بالإسبريسو، كريمة الماسكاربوني، غبار الكاكاو.',
    de: 'Klassisches italienisches Dessert mit Espresso-getränkten Löffelbiskuits, Mascarponecreme, Kakaopulver.'
  },
  'Profiteroles': {
    en: 'Light choux pastry puffs filled with vanilla custard, topped with warm chocolate sauce.',
    fr: 'Choux légers garnis de crème pâtissière vanille, nappés de sauce chocolat chaude.',
    es: 'Hojaldrinas de pasta choux rellenas de crema pastelera de vainilla, cubiertas con salsa de chocolate caliente.',
    ar: 'كرات عجينة شو خفيفة محشوة بكاستارد الفانيليا، مغطاة بصلصة الشوكولاتة الدافئة.',
    de: 'Leichte Windbeutel gefüllt mit Vanillecreme, mit warmer Schokoladensauce übergossen.'
  },
  'Artisan Gelato Trio': {
    en: 'Three scoops of house-made gelato: pistachio, stracciatella, and salted caramel.',
    fr: 'Trois boules de gelato maison: pistache, stracciatella et caramel salé.',
    es: 'Tres bolas de gelato casero: pistacho, stracciatella y caramelo salado.',
    ar: 'ثلاث كرات من الجيلاتو المصنوع منزليًا: فستق، ستراتشياتيلا، وكراميل مملح.',
    de: 'Drei Kugeln hausgemachtes Gelato: Pistazie, Stracciatella und gesalzenes Karamell.'
  }
};

async function addTranslatedDescriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/qr-menu', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Get all menu items
    const menuItems = await MenuItem.find({});
    console.log(`Found ${menuItems.length} menu items to update`);

    let updatedCount = 0;

    for (const item of menuItems) {
      const translations = translatedDescriptions[item.title];
      
      if (translations) {
        // Update the item with translated descriptions
        await MenuItem.findByIdAndUpdate(item._id, {
          $set: {
            descriptions: translations
          }
        });
        console.log(`✓ Updated translations for: ${item.title}`);
        updatedCount++;
      } else {
        console.log(`⚠ No translations found for: ${item.title}`);
      }
    }

    console.log(`\n✓ Successfully updated ${updatedCount} menu items with translated descriptions`);
    console.log('✓ Dish names remain in their original language');
    console.log('✓ Descriptions are now available in 5 languages (English, French, Spanish, Arabic, German)');

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
addTranslatedDescriptions();
