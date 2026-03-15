const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/qr-menu';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    await seedDatabase();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      const qrData = await QRCode.toDataURL('http://localhost:3000/menu/sunrise-cafe');
      const restaurant = await Restaurant.create({
        name: 'Sunrise Café',
        slug: 'sunrise-cafe',
        logoUrl: 'https://img.logoipsum.com/243.svg',
        adminKey: process.env.ADMIN_KEY || 'changeme',
        qrCode: qrData
      });

      const menuItems = [
        {
          restaurantId: restaurant._id,
          title: 'Wagyu Beef Burger',
          titles: {
            en: 'Wagyu Beef Burger',
            fr: 'Burger de Bœuf Wagyu',
            es: 'Hamburguesa de Ternera Wagyu',
            ar: 'برجر لحم واغيو',
            de: 'Wagyu-Rindfleisch-Burger'
          },
          description: 'Premium Wagyu beef patty, truffle aioli, caramelized onions, aged cheddar, arugula on brioche bun.',
          descriptions: {
            en: 'Premium Wagyu beef patty, truffle aioli, caramelized onions, aged cheddar, arugula on brioche bun.',
            fr: 'Galette de bœuf Wagyu premium, aïoli à la truffe, oignons caramélisés, cheddar affiné, roquette sur pain brioché.',
            es: 'Hamburguesa de ternera Wagyu premium, alioli de trufa, cebolla caramelizada, queso cheddar añejo, rúcula en pan brioche.',
            ar: 'شريحة لحم واغيو فاخرة، أيولي الكمأة، بصل مكرمل، شيدر معتق، جرجير على خبز بريوش.',
            de: 'Premium Wagyu-Rindfleisch-Patty, Trüffel-Aioli, karamellisierte Zwiebeln, gereifter Cheddar, Rucola auf Brioche-Brötchen.'
          },
          price: 18.99,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Neapolitan Margherita Pizza',
          titles: {
            en: 'Neapolitan Margherita Pizza',
            fr: 'Pizza Margherita Napolitaine',
            es: 'Pizza Margarita Napolitana',
            ar: 'بيتزا مارغريتا نابولي',
            de: 'Neapolitanische Margherita Pizza'
          },
          description: 'Wood-fired pizza with San Marzano tomatoes, buffalo mozzarella, fresh basil, EVOO.',
          descriptions: {
            en: 'Wood-fired pizza with San Marzano tomatoes, buffalo mozzarella, fresh basil, EVOO.',
            fr: 'Pizza cuite au feu de bois avec tomates San Marzano, mozzarella de bufflonne, basilic frais, huile d\'olive.',
            es: 'Pizza al horno de leña con tomates San Marzano, mozzarella de búfala, albahaca fresca, aceite de oliva virgen extra.',
            ar: 'بيتزا مشوية بالحطب مع طماطم سان مارزانو، موتزاريلا الجاموس، ريحان طازج، زيت زيتون بكر.',
            de: 'Holzofenpizza mit San-Marzano-Tomaten, Büffelmozzarella, frischem Basilikum, natives Olivenöl extra.'
          },
          price: 16.99,
          image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Grilled Atlantic Salmon',
          titles: {
            en: 'Grilled Atlantic Salmon',
            fr: 'Saumon Atlantique Grillé',
            es: 'Salmón del Atlántico a la Parrilla',
            ar: 'سلمون أطلسي مشوي',
            de: 'Gegrillter Atlantik-Lachs'
          },
          description: 'Fresh Atlantic salmon with lemon butter, asparagus, roasted potatoes, dill cream sauce.',
          descriptions: {
            en: 'Fresh Atlantic salmon with lemon butter, asparagus, roasted potatoes, dill cream sauce.',
            fr: 'Saumon atlantique frais au beurre citronné, asperges, pommes de terre rôties, sauce crémeuse à l\'aneth.',
            es: 'Salmón del Atlántico fresco con mantequilla de limón, espárragos, patatas asadas, salsa cremosa de eneldo.',
            ar: 'سلمون أطلسي طازج مع زبدة ليمون، هليون، بطاطس محمصة، صلصة كريمة الشبت.',
            de: 'Frischer Atlantik-Lachs mit Zitronenbutter, Spargel, Röstkartoffeln, Dill-Rahmsauce.'
          },
          price: 22.99,
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Truffle Mushroom Risotto',
          titles: {
            en: 'Truffle Mushroom Risotto',
            fr: 'Risotto aux Champignons et Truffe',
            es: 'Risotto de Champiñones con Trufa',
            ar: 'ريزوتو الفطر بالكمأة',
            de: 'Trüffel-Pilz-Risotto'
          },
          description: 'Creamy arborio rice with porcini mushrooms, white truffle oil, parmesan, fresh herbs.',
          descriptions: {
            en: 'Creamy arborio rice with porcini mushrooms, white truffle oil, parmesan, fresh herbs.',
            fr: 'Riz arborio crémeux avec champignons porcini, huile de truffe blanche, parmesan, herbes fraîches.',
            es: 'Arroz arborio cremoso con setas porcini, aceite de trufa blanca, parmesano, hierbas frescas.',
            ar: 'أرز أربوريو كريمي مع فطر بورشيني، زيت الكمأة البيضاء، بارميزان، أعشاب طازجة.',
            de: 'Cremiger Arborio-Reis mit Steinpilzen, weißem Trüffelöl, Parmesan, frischen Kräutern.'
          },
          price: 19.99,
          image: 'https://images.unsplash.com/photo-1476124369491-c4cd74d3ff10?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Prime Ribeye Steak',
          titles: {
            en: 'Prime Ribeye Steak',
            fr: 'Entrecôte Prime',
            es: 'Chuletón Prime',
            ar: 'ستيك ريب آي فاخر',
            de: 'Prime Ribeye Steak'
          },
          description: '12oz USDA Prime ribeye, herb butter, garlic mashed potatoes, grilled vegetables.',
          descriptions: {
            en: '12oz USDA Prime ribeye, herb butter, garlic mashed potatoes, grilled vegetables.',
            fr: 'Entrecôte USDA Prime de 340g, beurre aux herbes, purée de pommes de terre à l\'ail, légumes grillés.',
            es: 'Chuletón USDA Prime de 340g, mantequilla de hierbas, puré de papas con ajo, verduras a la parrilla.',
            ar: 'ريب آي USDA بريميوم 340غ، زبدة الأعشاب، بطاطس مهروسة بالثوم، خضروات مشوية.',
            de: '340g USDA Prime Ribeye, Kräuterbutter, Knoblauch-Kartoffelpüree, gegrilltes Gemüse.'
          },
          price: 32.99,
          image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Lobster Linguine',
          titles: {
            en: 'Lobster Linguine',
            fr: 'Linguine au Homard',
            es: 'Linguine de Langosta',
            ar: 'لينغويني بالكركند',
            de: 'Hummer-Linguine'
          },
          description: 'Fresh lobster tail, garlic white wine sauce, cherry tomatoes, basil, parmesan.',
          descriptions: {
            en: 'Fresh lobster tail, garlic white wine sauce, cherry tomatoes, basil, parmesan.',
            fr: 'Queue de homard fraîche, sauce au vin blanc à l\'ail, tomates cerises, basilic, parmesan.',
            es: 'Cola de langosta fresca, salsa de vino blanco con ajo, tomates cherry, albahaca, parmesano.',
            ar: 'ذيل كركند طازج، صلصة نبيذ أبيض بالثوم، طماطم كرزية، ريحان، بارميزان.',
            de: 'Frischer Hummerschwanz, Knoblauch-Weißweinsauce, Kirschtomaten, Basilikum, Parmesan.'
          },
          price: 28.99,
          image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Pan-Seared Duck Breast',
          titles: {
            en: 'Pan-Seared Duck Breast',
            fr: 'Magret de Canard Poêlé',
            es: 'Pechuga de Pato a la Sartén',
            ar: 'صدر بط محمر',
            de: 'Gebratene Entenbrust'
          },
          description: 'Tender duck breast, cherry reduction, roasted root vegetables, crispy skin.',
          descriptions: {
            en: 'Tender duck breast, cherry reduction, roasted root vegetables, crispy skin.',
            fr: 'Magret de canard tendre, réduction de cerise, légumes-racines rôtis, peau croustillante.',
            es: 'Pechuga de pato tierna, reducción de cereza, vegetales de raíz asados, piel crujiente.',
            ar: 'صدر بط طري، صوص الكرز المخفض، خضروات جذرية محمصة، جلد مقرمش.',
            de: 'Zarte Entenbrust, Kirschreduktion, geröstetes Wurzelgemüse, knusprige Haut.'
          },
          price: 26.99,
          image: 'https://images.unsplash.com/photo-1604908815969-23b25e1aa728?w=800&q=80',
          category: 'Main'
        },
        {
          restaurantId: restaurant._id,
          title: 'Sushi Platter Deluxe',
          titles: {
            en: 'Sushi Platter Deluxe',
            fr: 'Plateau de Sushi Deluxe',
            es: 'Bandeja de Sushi Deluxe',
            ar: 'طبق سوشي ديلوكس',
            de: 'Sushi-Platte Deluxe'
          },
          description: 'Chef selection: 8 pieces nigiri, 6 pieces sashimi, California roll, wasabi, ginger.',
          descriptions: {
            en: 'Chef selection: 8 pieces nigiri, 6 pieces sashimi, California roll, wasabi, ginger.',
            fr: 'Sélection du chef : 8 pièces nigiri, 6 pièces sashimi, California roll, wasabi, gingembre.',
            es: 'Selección del chef: 8 piezas nigiri, 6 piezas sashimi, California roll, wasabi, jengibre.',
            ar: 'اختيار الشيف: 8 قطع نيجيري، 6 قطع ساشيمي، كاليفورنيا رول، واسابي، زنجبيل.',
            de: 'Auswahl des Küchenchefs: 8 Stück Nigiri, 6 Stück Sashimi, California Roll, Wasabi, Ingwer.'
          },
          price: 24.99,
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
          category: 'Main'
        },

        {
          restaurantId: restaurant._id,
          title: 'Crispy Calamari',
          titles: {
            en: 'Crispy Calamari',
            fr: 'Calamars Croustillants',
            es: 'Calamares Crujientes',
            ar: 'كالاماري مقرمش',
            de: 'Knusprige Calamari'
          },
          description: 'Lightly fried calamari rings, marinara sauce, lemon aioli, fresh herbs.',
          descriptions: {
            en: 'Lightly fried calamari rings, marinara sauce, lemon aioli, fresh herbs.',
            fr: 'Anneaux de calamars légèrement frits, sauce marinara, aïoli au citron, herbes fraîches.',
            es: 'Anillos de calamar ligeramente fritos, salsa marinara, alioli de limón, hierbas frescas.',
            ar: 'حلقات كالاماري مقلية خفيفة، صلصة مارينارا، أيولي ليمون، أعشاب طازجة.',
            de: 'Leicht frittierte Calamari-Ringe, Marinara-Sauce, Zitronen-Aioli, frische Kräuter.'
          },
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
          category: 'Appetizers'
        },
        {
          restaurantId: restaurant._id,
          title: 'Bruschetta Trio',
          titles: {
            en: 'Bruschetta Trio',
            fr: 'Trio de Bruschetta',
            es: 'Trío de Bruschetta',
            ar: 'ثلاثية بروشيتا',
            de: 'Bruschetta-Trio'
          },
          description: 'Toasted crostini with tomato basil, mushroom truffle, and prosciutto toppings.',
          descriptions: {
            en: 'Toasted crostini with tomato basil, mushroom truffle, and prosciutto toppings.',
            fr: 'Crostini grillés garnis de tomate-basilic, champignons-truffe et prosciutto.',
            es: 'Crostini tostados con topping de tomate-albahaca, champiñones-trufa y prosciutto.',
            ar: 'كروستيني محمص مع طماطم-ريحان، فطر-كمأة، وبروشوتو.',
            de: 'Geröstete Crostini mit Tomate-Basilikum, Pilz-Trüffel und Prosciutto-Belag.'
          },
          price: 10.99,
          image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80',
          category: 'Appetizers'
        },
        {
          restaurantId: restaurant._id,
          title: 'Shrimp Tempura',
          titles: {
            en: 'Shrimp Tempura',
            fr: 'Tempura de Crevettes',
            es: 'Tempura de Camarones',
            ar: 'تمبورا الروبيان',
            de: 'Garnelen-Tempura'
          },
          description: 'Crispy tempura shrimp, sweet chili sauce, pickled vegetables.',
          descriptions: {
            en: 'Crispy tempura shrimp, sweet chili sauce, pickled vegetables.',
            fr: 'Crevettes tempura croustillantes, sauce piment doux, légumes marinés.',
            es: 'Camarones tempura crujientes, salsa de chile dulce, vegetales encurtidos.',
            ar: 'روبيان تمبورا مقرمش، صلصة الفلفل الحار الحلو، خضروات مخللة.',
            de: 'Knusprige Tempura-Garnelen, süße Chilisauce, eingelegtes Gemüse.'
          },
          price: 13.99,
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
          category: 'Appetizers'
        },
        {
          restaurantId: restaurant._id,
          title: 'Caprese Salad',
          titles: {
            en: 'Caprese Salad',
            fr: 'Salade Caprese',
            es: 'Ensalada Caprese',
            ar: 'سلطة كابريزي',
            de: 'Caprese-Salat'
          },
          description: 'Fresh mozzarella, heirloom tomatoes, basil, balsamic glaze, EVOO.',
          descriptions: {
            en: 'Fresh mozzarella, heirloom tomatoes, basil, balsamic glaze, EVOO.',
            fr: 'Mozzarella fraîche, tomates anciennes, basilic, glaçage balsamique, huile d\'olive extra vierge.',
            es: 'Mozzarella fresca, tomates reliquia, albahaca, glaseado balsámico, aceite de oliva virgen extra.',
            ar: 'موتزاريلا طازجة، طماطم تراثية، ريحان، صقيل بلسميك، زيت زيتون بكر.',
            de: 'Frischer Mozzarella, Erbstück-Tomaten, Basilikum, Balsamico-Glasur, natives Olivenöl extra.'
          },
          price: 11.99,
          image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800&q=80',
          category: 'Appetizers'
        },
        {
          restaurantId: restaurant._id,
          title: 'French Onion Soup',
          titles: {
            en: 'French Onion Soup',
            fr: 'Soupe à l\'Oignon Française',
            es: 'Sopa de Cebolla Francesa',
            ar: 'شوربة البصل الفرنسية',
            de: 'Französische Zwiebelsuppe'
          },
          description: 'Caramelized onions, beef broth, gruyere cheese, crusty bread.',
          descriptions: {
            en: 'Caramelized onions, beef broth, gruyere cheese, crusty bread.',
            fr: 'Oignons caramélisés, bouillon de bœuf, fromage gruyère, pain croûté.',
            es: 'Cebollas caramelizadas, caldo de res, queso gruyere, pan crujiente.',
            ar: 'بصل مكرمل، مرق لحم بقري، جبن جروييه، خبز مقرمش.',
            de: 'Karamellisierte Zwiebeln, Rinderbrühe, Gruyère-Käse, knuspriges Brot.'
          },
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
          category: 'Appetizers'
        },

        {
          restaurantId: restaurant._id,
          title: 'Fresh Pressed Juices',
          titles: {
            en: 'Fresh Pressed Juices',
            fr: 'Jus Frais Pressés',
            es: 'Jugos Recién Exprimidos',
            ar: 'عصائر طازجة',
            de: 'Frisch gepresste Säfte'
          },
          description: 'Daily selection of cold-pressed organic juices: orange, carrot, green detox.',
          descriptions: {
            en: 'Daily selection of cold-pressed organic juices: orange, carrot, green detox.',
            fr: 'Sélection quotidienne de jus bio pressés à froid : orange, carotte, détox vert.',
            es: 'Selección diaria de jugos orgánicos prensados en frío: naranja, zanahoria, detox verde.',
            ar: 'تشكيلة يومية من العصائر العضوية المعصورة على البارد: برتقال، جزر، ديتوكس أخضر.',
            de: 'Tägliche Auswahl an kaltgepressten Bio-Säften: Orange, Karotte, grüner Detox.'
          },
          price: 6.99,
          image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
          category: 'Drinks'
        },
        {
          restaurantId: restaurant._id,
          title: 'Specialty Coffee',
          titles: {
            en: 'Specialty Coffee',
            fr: 'Café Spécialisé',
            es: 'Café Especializado',
            ar: 'قهوة متخصصة',
            de: 'Spezialitätenkaffee'
          },
          description: 'Espresso, cappuccino, latte, or flat white with premium arabica beans.',
          descriptions: {
            en: 'Espresso, cappuccino, latte, or flat white with premium arabica beans.',
            fr: 'Espresso, cappuccino, latte ou flat white avec grains arabica premium.',
            es: 'Espresso, capuchino, latte o flat white con granos arábica premium.',
            ar: 'إسبريسو، كابتشينو، لاتيه، أو فلات وايت مع حبوب أرابيكا فاخرة.',
            de: 'Espresso, Cappuccino, Latte oder Flat White mit Premium-Arabica-Bohnen.'
          },
          price: 4.99,
          image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
          category: 'Drinks'
        },
        {
          restaurantId: restaurant._id,
          title: 'Tropical Smoothie Bowl',
          titles: {
            en: 'Tropical Smoothie Bowl',
            fr: 'Bol Smoothie Tropical',
            es: 'Bowl de Smoothie Tropical',
            ar: 'بول سموذي استوائي',
            de: 'Tropischer Smoothie Bowl'
          },
          description: 'Mango, pineapple, banana, coconut milk, topped with granola and berries.',
          descriptions: {
            en: 'Mango, pineapple, banana, coconut milk, topped with granola and berries.',
            fr: 'Mangue, ananas, banane, lait de coco, garni de granola et de baies.',
            es: 'Mango, piña, plátano, leche de coco, cubierto con granola y frutos rojos.',
            ar: 'مانجو، أناناس، موز، حليب جوز الهند، مغطى بالجرانولا والتوت.',
            de: 'Mango, Ananas, Banane, Kokosmilch, garniert mit Granola und Beeren.'
          },
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80',
          category: 'Drinks'
        },
        {
          restaurantId: restaurant._id,
          title: 'Artisan Iced Tea',
          titles: {
            en: 'Artisan Iced Tea',
            fr: 'Thé Glacé Artisanal',
            es: 'Té Helado Artesanal',
            ar: 'شاي مثلج حرفي',
            de: 'Handwerklicher Eistee'
          },
          description: 'House-brewed iced tea: peach, passion fruit, or green tea with mint.',
          descriptions: {
            en: 'House-brewed iced tea: peach, passion fruit, or green tea with mint.',
            fr: 'Thé glacé maison : pêche, fruit de la passion ou thé vert à la menthe.',
            es: 'Té helado de la casa: durazno, maracuyá o té verde con menta.',
            ar: 'شاي مثلج من صنع المنزل: خوخ، فاكهة الباشن، أو شاي أخضر بالنعناع.',
            de: 'Hauseigener Eistee: Pfirsich, Passionsfrucht oder grüner Tee mit Minze.'
          },
          price: 4.49,
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
          category: 'Drinks'
        },
        {
          restaurantId: restaurant._id,
          title: 'Classic Milkshake',
          titles: {
            en: 'Classic Milkshake',
            fr: 'Milkshake Classique',
            es: 'Batido Clásico',
            ar: 'ميلك شيك كلاسيكي',
            de: 'Klassischer Milchshake'
          },
          description: 'Vanilla, chocolate, or strawberry with whipped cream and cherry.',
          descriptions: {
            en: 'Vanilla, chocolate, or strawberry with whipped cream and cherry.',
            fr: 'Vanille, chocolat ou fraise avec crème fouettée et cerise.',
            es: 'Vainilla, chocolate o fresa con crema batida y cereza.',
            ar: 'فانيليا، شوكولاتة، أو فراولة مع كريمة مخفوقة وكرز.',
            de: 'Vanille, Schokolade oder Erdbeere mit Schlagsahne und Kirsche.'
          },
          price: 6.49,
          image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80',
          category: 'Drinks'
        },

        {
          restaurantId: restaurant._id,
          title: 'Molten Chocolate Lava Cake',
          titles: {
            en: 'Molten Chocolate Lava Cake',
            fr: 'Gâteau au Chocolat Fondant',
            es: 'Pastel de Lava de Chocolate',
            ar: 'كعكة الشوكولاتة البركانية',
            de: 'Geschmolzener Schokoladen-Lava-Kuchen'
          },
          description: 'Warm chocolate cake with liquid center, vanilla ice cream, raspberry coulis.',
          descriptions: {
            en: 'Warm chocolate cake with liquid center, vanilla ice cream, raspberry coulis.',
            fr: 'Gâteau au chocolat chaud avec cœur liquide, glace vanille, coulis de framboise.',
            es: 'Pastel de chocolate caliente con centro líquido, helado de vainilla, coulis de frambuesa.',
            ar: 'كعكة شوكولاتة دافئة مع مركز سائل، آيس كريم فانيليا، كولي توت العليق.',
            de: 'Warmer Schokoladenkuchen mit flüssigem Kern, Vanilleeis, Himbeercoulis.'
          },
          price: 9.99,
          image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80',
          category: 'Desserts'
        },
        {
          restaurantId: restaurant._id,
          title: 'Classic Crème Brûlée',
          titles: {
            en: 'Classic Crème Brûlée',
            fr: 'Crème Brûlée Classique',
            es: 'Crema Catalana Clásica',
            ar: 'كريم بروليه كلاسيكي',
            de: 'Klassische Crème Brûlée'
          },
          description: 'Silky vanilla custard with caramelized sugar crust, fresh berries.',
          descriptions: {
            en: 'Silky vanilla custard with caramelized sugar crust, fresh berries.',
            fr: 'Crème vanillée soyeuse avec croûte de sucre caramélisé, baies fraîches.',
            es: 'Crema de vainilla sedosa con costra de azúcar caramelizado, frutos rojos frescos.',
            ar: 'كاسترد فانيليا حريري مع قشرة سكر مكرملة، توت طازج.',
            de: 'Seidiges Vanillepudding mit karamellisierter Zuckerkruste, frische Beeren.'
          },
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&q=80',
          category: 'Desserts'
        },
        {
          restaurantId: restaurant._id,
          title: 'New York Cheesecake',
          titles: {
            en: 'New York Cheesecake',
            fr: 'Cheesecake New-Yorkais',
            es: 'Tarta de Queso New York',
            ar: 'تشيز كيك نيويورك',
            de: 'New York Käsekuchen'
          },
          description: 'Creamy cheesecake, graham cracker crust, mixed berry compote.',
          descriptions: {
            en: 'Creamy cheesecake, graham cracker crust, mixed berry compote.',
            fr: 'Cheesecake crémeux, croûte de biscuits graham, compote de fruits rouges.',
            es: 'Tarta de queso cremosa, base de galletas graham, compota de frutos mixtos.',
            ar: 'تشيز كيك كريمي، قاعدة بسكويت غراهام، كومبوت التوت المشكل.',
            de: 'Cremiger Käsekuchen, Graham-Cracker-Boden, gemischtes Beerenkompott.'
          },
          price: 8.49,
          image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&q=80',
          category: 'Desserts'
        },
        {
          restaurantId: restaurant._id,
          title: 'Tiramisu',
          titles: {
            en: 'Tiramisu',
            fr: 'Tiramisu',
            es: 'Tiramisú',
            ar: 'تيراميسو',
            de: 'Tiramisu'
          },
          description: 'Classic Italian dessert with espresso-soaked ladyfingers, mascarpone, cocoa.',
          descriptions: {
            en: 'Classic Italian dessert with espresso-soaked ladyfingers, mascarpone, cocoa.',
            fr: 'Dessert italien classique avec biscuits à la cuillère imbibés d\'espresso, mascarpone, cacao.',
            es: 'Postre italiano clásico con bizcochos de soletilla empapados en espresso, mascarpone, cacao.',
            ar: 'حلوى إيطالية كلاسيكية مع بسكويت منقوع بالإسبريسو، ماسكاربوني، كاكاو.',
            de: 'Klassisches italienisches Dessert mit Espresso-getränkten Löffelbiskuits, Mascarpone, Kakao.'
          },
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
          category: 'Desserts'
        },
        {
          restaurantId: restaurant._id,
          title: 'Profiteroles',
          titles: {
            en: 'Profiteroles',
            fr: 'Profiteroles',
            es: 'Profiteroles',
            ar: 'بروفيترول',
            de: 'Profiteroles'
          },
          description: 'Choux pastry puffs filled with vanilla cream, chocolate ganache.',
          descriptions: {
            en: 'Choux pastry puffs filled with vanilla cream, chocolate ganache.',
            fr: 'Choux fourrés de crème vanille, ganache au chocolat.',
            es: 'Bolitas de masa choux rellenas de crema de vainilla, ganache de chocolate.',
            ar: 'كرات معجنات شو محشوة بكريمة الفانيليا، جاناش الشوكولاتة.',
            de: 'Brandteig-Windbeutel gefüllt mit Vanillecreme, Schokoladenganache.'
          },
          price: 9.49,
          image: 'https://images.unsplash.com/photo-1612201142855-9d974ab6b7e1?w=800&q=80',
          category: 'Desserts'
        },
        {
          restaurantId: restaurant._id,
          title: 'Artisan Gelato Trio',
          titles: {
            en: 'Artisan Gelato Trio',
            fr: 'Trio de Gelato Artisanal',
            es: 'Trío de Gelato Artesanal',
            ar: 'ثلاثية جيلاتو حرفية',
            de: 'Handwerkliches Gelato-Trio'
          },
          description: 'Three scoops: pistachio, stracciatella, and salted caramel.',
          descriptions: {
            en: 'Three scoops: pistachio, stracciatella, and salted caramel.',
            fr: 'Trois boules : pistache, stracciatella et caramel salé.',
            es: 'Tres bolas: pistacho, stracciatella y caramelo salado.',
            ar: 'ثلاث كرات: فستق، ستراتشاتيلا، وكراميل مملح.',
            de: 'Drei Kugeln: Pistazie, Stracciatella und Salzkaramell.'
          },
          price: 7.99,
          image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
          category: 'Desserts'
        }
      ];

      await MenuItem.insertMany(menuItems);
      console.log('✅ Database seeded with restaurant and menu items');
    }
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

module.exports = connectDB;
