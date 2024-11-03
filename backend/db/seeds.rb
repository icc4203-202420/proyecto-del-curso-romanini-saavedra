require 'factory_bot_rails'

# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Initialize the review counter
ReviewCounter.create(count: 0)

if Rails.env.development?

  # Crear países
  countries = FactoryBot.create_list(:country, 5)

  # Crear cervecerías (breweries) con marcas (brands) y cervezas (beers)
  countries.map do |country|
    FactoryBot.create(:brewery_with_brands_with_beers, countries: [country])
  end

  # Crear un usuario para testeo
  test_user = User.create!(
    email: 'test@example.com',
    password: 'password123',
    password_confirmation: 'password123',
    first_name: 'Test',
    last_name: 'User',
    handle: "testUserHandle"
  )

  caromanini = User.create!(
    email: 'caromanini@miuandes.cl',
    password: 'password123',
    password_confirmation: 'password123',
    first_name: 'Chiara',
    last_name: 'Romanini',
    handle: "caromanini"
  )

  fasaavedra = User.create!(
    email: 'fasaavedra@miuandes.cl',
    password: 'password123',
    password_confirmation: 'password123',
    first_name: 'Fabian',
    last_name: 'Saavedra',
    handle: "fasaavedra"
  )

  User.create!(
    email: "jdoe@example.com",
    password: "password123",
    password_confirmation: "password123",
    first_name: "John",
    last_name: "Doe",
    handle: "jdoe"
  )

  User.create!(
    email: "asmith@example.com",
    password: "password123",
    password_confirmation: "password123",
    first_name: "Alice",
    last_name: "Smith",
    handle: "asmith"
  )

  User.create!(
    email: "browns@example.com",
    password: "password123",
    password_confirmation: "password123",
    first_name: "Bob",
    last_name: "Brown",
    handle: "browns"
  )

  User.create!(
    email: "cjones@example.com",
    password: "password123",
    password_confirmation: "password123",
    first_name: "Carol",
    last_name: "Jones",
    handle: "cjones"
  )

  User.create!(
    email: "dwhite@example.com",
    password: "password123",
    password_confirmation: "password123",
    first_name: "David",
    last_name: "White",
    handle: "dwhite"
  )

  Review.create!(
    text: "Amazing beer! This was the best beer I have ever had! 10/10 would recommend. The best",
    rating: 5,
    user_id: 2,
    beer_id: 1
  )

  Review.create!(
    text: "This is the worst beer I have ever had. The worst ever. I don't like this style of beer. The worst.",
    rating: 1.1,
    user_id: 1,
    beer_id: 1
  )

  Review.create!(
    text: "This beer has a smooth, malty flavor with a hint of caramel. The hops provide a nice balance, making it refreshing and flavorful",
    rating: 4.6,
    user_id: 3,
    beer_id: 1
  )

  Review.create!(
    text: "This beer has a rich, hoppy flavor with hints of citrus and pine. It's well-balanced and has a crisp finish.",
    rating: 4.2,
    user_id: 1,
    beer_id: 2
  )

  Review.create!(
    text: "A delightful beer with a strong malt presence and a touch of sweetness. The bitterness is just right, making it very drinkable.",
    rating: 4.5,
    user_id: 2,
    beer_id: 3
  )

  Review.create!(
    text: "An excellent IPA with bold hop flavors and a lingering aftertaste. It's a bit intense but enjoyable for hop lovers.",
    rating: 4.7,
    user_id: 4,
    beer_id: 1
  )

  Review.create!(
    text: "This lager offers a clean, crisp taste with subtle notes of bread and cereal. It's smooth and refreshing, perfect for a hot day.",
    rating: 4.0,
    user_id: 5,
    beer_id: 2
  )

  Review.create(
    text: "A robust stout with rich chocolate and coffee notes. It's creamy and satisfying, with a strong, yet smooth, finish.",
    rating: 4.8,
    user_id: 6,
    beer_id: 3
  )

  address = Address.create!(user: test_user, country: countries.sample)

  # Crear usuarios con direcciones asociadas
  users = FactoryBot.create_list(:user, 10) do |user, i|
    user.address.update(country: countries.sample)
  end

  # Crear bares con direcciones y cervezas asociadas
  bars = FactoryBot.create_list(:bar, 6) do |bar|
    bar.address.update(country: countries.sample)
    bar.beers << Beer.all.sample(rand(1..3))
  end

  # Crear eventos asociados a los bares
  # events = bars.map do |bar|
  #   FactoryBot.create(:event, bar: bar)
  # end
  events = Event.create([
    {
      name: "Opening Celebration 1",
      description: "Join us for a spectacular evening as we celebrate the grand opening of our bar!",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 1
    },
    {
      name: "Opening Celebration 2",
      description: "Join us for a spectacular evening as we celebrate the grand opening of our bar!",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 2
    },
    {
      name: "Opening Celebration 3",
      description: "Join us for a spectacular evening as we celebrate the grand opening of our bar!",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 3
    },
    {
      name: "Opening Celebration 4",
      description: "Join us for a spectacular evening as we celebrate the grand opening of our bar!",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 4
    },
    {
      name: "Opening Celebration 5",
      description: "Join us for a spectacular evening as we celebrate the grand opening of our bar!",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 5
    },
    {
      name: "Opening Celebration 6",
      description: "Join us for a spectacular evening as we celebrate the grand opening of our bar!",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 6
    },
    {
      name: "Happy Hour 1",
      description: "Join us at our bar for an evening of fun with great drinks, delicious bites, and lively vibes.",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 1
    },
    {
      name: "Happy Hour 2",
      description: "Join us at our bar for an evening of fun with great drinks, delicious bites, and lively vibes.",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 2
    },
    {
      name: "Happy Hour 3",
      description: "Join us at our bar for an evening of fun with great drinks, delicious bites, and lively vibes.",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 3
    },
    {
      name: "Happy Hour 4",
      description: "Join us at our bar for an evening of fun with great drinks, delicious bites, and lively vibes.",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 4
    },
    {
      name: "Happy Hour 5",
      description: "Join us at our bar for an evening of fun with great drinks, delicious bites, and lively vibes.",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 5
    },
    {
      name: "Happy Hour 6",
      description: "Join us at our bar for an evening of fun with great drinks, delicious bites, and lively vibes.",
      date: DateTime.now + 1.week,
      start_date: DateTime.now + 1.week,
      end_date: DateTime.now + 1.week + 4.hours,
      bar_id: 6
    }

  ])

  # Crear relaciones de amistad entre usuarios
  users.combination(2).to_a.sample(5).each do |user_pair|
    FactoryBot.create(:friendship, user: user_pair[0], friend: user_pair[1], bar: bars.sample)
  end

  # Crear attendances (asistencia) de usuarios a eventos
  users.each do |user|
    events.sample(rand(1..3)).each do |event|
      FactoryBot.create(:attendance, user: user, event: event, checked_in: [true, false].sample)
    end
  end

  # Creaciones asociadas a nuevos bares buscables (Entrega1.4)
  # Crear Chile
  chile = Country.find_or_create_by!(name: 'Chile')

  # Crear cervecerías (breweries) con marcas (brands) y cervezas (beers)
  # Crear la dirección para el Bar La Providencia
  la_providencia_address = Address.create!(
    line1: 'Isabel La Católica 4208',
    line2: 'Las Condes',
    city: 'Santiago',
    country: chile,
    user: test_user
  )

  latitude = -33.42628
  longitude = -70.56437

  # Crear el bar 'Bar La Providencia'
  bar_la_providencia = Bar.create!(
    name: 'Bar La Providencia',
    latitude: latitude,
    longitude: longitude,
    address: la_providencia_address
  )

  # Asignar cervezas aleatorias al bar (puedes modificar el rango)
  bar_la_providencia.beers << Beer.all.sample(rand(1..3))

  # Crear un evento asociado a 'Bar La Providencia'
  event = FactoryBot.create(:event, bar: bar_la_providencia)

  # Crear dirección para el Bar Santiago Vitacura
vitacura_address = Address.create!(
  line1: 'Av Vitacura 7120',
  line2: 'Vitacura',
  city: 'Santiago',
  country: chile,
  user: test_user
)

latitude = -33.38072
longitude = -70.56469

# Crear el bar 'Bar Santiago Vitacura'
bar_santiago_vitacura = Bar.create!(
  name: 'Bar Santiago Vitacura',
  latitude: latitude,
  longitude: longitude,
  address: vitacura_address
)

# Asignar cervezas aleatorias al bar (puedes modificar el rango)
bar_santiago_vitacura.beers << Beer.all.sample(rand(1..3))

# Crear un evento asociado a 'Bar Santiago Vitacura'
event = FactoryBot.create(:event, bar: bar_santiago_vitacura)

end
