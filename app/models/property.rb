class Property < ActiveRecord::Base
  validates :address, :lat, :lng, presence: true
  validates :address, uniqueness: true

  belongs_to :neighborhood
  has_many :reviews

  has_attached_file :image, styles: { medium: "300x300>", thumb: "100x100>" }, default_url: "default_pic.jpg"
  validates_attachment_content_type :image, content_type: /\Aimage\/.*\Z/

  belongs_to(
    :owner,
    class_name: :User,
    primary_key: :id,
    foreign_key: :owner_id
  )

  def self.satisfy_params(filters)
    if filters[:bounds] && filters[:neighborhood_id] && !filters[:price] && !filters[:num_bedrooms]
      properties = self.where(
      lat:  filters[:bounds][:southWest][:lat]...filters[:bounds][:northEast][:lat],
      lng: filters[:bounds][:southWest][:lng]...filters[:bounds][:northEast][:lng]
      ).where('neighborhood_id = ?', filters[:neighborhood_id])
    elsif filters[:bounds] && filters[:neighborhood_id] && filters[:price] &&
      properties = self.where(
      lat:  filters[:bounds][:southWest][:lat]...filters[:bounds][:northEast][:lat],
      lng: filters[:bounds][:southWest][:lng]...filters[:bounds][:northEast][:lng]
      ).where('price < ?', filters[:price])
      .where('neighborhood_id = ?', filters[:neighborhood_id])
    elsif filters[:bounds] && filters[:neighborhood_id] && filters[:num_bedrooms]
      properties = self.where(
      lat:  filters[:bounds][:southWest][:lat]...filters[:bounds][:northEast][:lat],
      lng: filters[:bounds][:southWest][:lng]...filters[:bounds][:northEast][:lng]
      )
      .where('num_bedrooms <= ?', filters[:num_bedrooms])
      .where('neighborhood_id = ?', filters[:neighborhood_id])
    elsif filters[:bounds]
      properties = self.where(
          lat:  filters[:bounds][:southWest][:lat]...filters[:bounds][:northEast][:lat],
          lng: filters[:bounds][:southWest][:lng]...filters[:bounds][:northEast][:lng]
        ).where('price < ?', filters[:price])
        .where('num_bedrooms <= ?', filters[:num_bedrooms])
        .where('neighborhood_id = ?', filters[:neighborhood_id])
    elsif filters[:price] && filters[:num_bedrooms] && [:neighborhood_id]
      properties = self
        .where('price < ?', filters[:price])
        .where('num_bedrooms <= ?', filters[:num_bedrooms])
        .where('neighborhood_id = ?', filters[:neighborhood_id])
    elsif filters[:price] && filters[:num_bedrooms]
      properties = self
        .where('price < ?', filters[:price])
        .where('num_bedrooms <= ?', filters[:num_bedrooms])
    elsif filters[:neighborhood_id] && filters[:num_bedrooms]
      properties = self
        .where('num_bedrooms <= ?', filters[:num_bedrooms])
        .where('neighborhood_id = ?', filters[:neighborhood_id])
    elsif filters[:price] && filters[:neighborhood_id]
      properties = self
        .where('price < ?', filters[:price])
        .where('neighborhood_id = ?', filters[:neighborhood_id])
    elsif filters[:neighborhood_id]
      properties = self.where('neighborhood_id = ?', filters[:neighborhood_id])
    elsif filters[:price]
      properties = self.where('price <= ?', filters[:price])
    elsif filters[:num_bedrooms]
      properties = self.where('num_bedrooms <= ?', filters[:num_bedrooms])
    end
    properties
  end

  def update_rating_averages!
    ratings = {
      count: self.reviews.count,
      prop_avg: self.reviews.average(:property_rating),
      lord_avg: self.reviews.average(:landlord_rating)
    }

    prop_avg, lord_avg = 0, 0
    if ratings[:count] > 0
      prop_avg = ratings[:prop_avg].round
      lord_avg = ratings[:lord_avg].round
    end

    self.avg_property_rating = prop_avg
    self.avg_landlord_rating = lord_avg
    self.save!
  end

end
