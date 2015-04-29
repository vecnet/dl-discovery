require 'json'
require 'rest_client'

#
# Convert place names to geoname ids and coordinates.
# While GeoNames does most of the work, we try to cache data
# as much as possible to decrease the number of API hits.
# Our cache stores both items of the form 'place name' => 'geoname id'
# as well as 'geoname id' => 'hash of location information'.
# This way we don't rely on the original place name being a canonical
# lookup for the GeoName id.
#
# usage:
#
# g = Geonames.new(cache_filename_or_nil)
# geoname_record = g.lookup_name("Kenya")
# g.save # when processing is finished, to persist the cache to disk
#
class Geonames
  class FileBackedCache
    # Load the cache from disk when started and save it when asked to.
    # Otherwise, this cache operates completely in memory.
    def initialize(cache_filename=nil)
      @cache_filename = cache_filename
      @cache = {}
      if cache_filename
        begin
          data = File.read(cache_filename)
          @cache = JSON.parse(data)
          STDERR.puts "loaded file #{cache_filename}"
        rescue Errno::ENOENT
        end
      end
    end

    def save
      if @cache_filename
        data = JSON.pretty_generate(@cache)
        File.write(@cache_filename, data)
      end
    end

    def lookup(key, &block)
      @cache.fetch(key, &block)
    end

    def insert(key, value)
      @cache[key] = value
    end
  end

  class Bbox
    # Store the west and east in a normalized form satisfying the
    # invariant west <= east <= west + 360
    # (unless we are uninitialized, in which case east < west).
    # We keep west in the range [-180, 180], and east in the range [-180, 540].
    # East values > 180 indicate this bbox crosses the anti-meridian.
    #
    # The need for a normal form comes about since we are really dealing with
    # equivalence classes of rectangles, and all are equally valid.
    # We pick the normal form as our representative of the class.
    # But this means we have to work a little to add a point or another bbox
    # to this one since we want to ensure we always choose the _smallest_
    # possible bbox with respect to area.
    attr_accessor :north, :east, :south, :west

    def initialize
      @north = -90
      @east = -180
      @south = 90
      @west = 180
    end

    # bbox is a hash with the keys "north", "south", "east", "west"
    # if east < west, then we assume the bbox crosses the anti-meridian.
    def add_bbox(bbox)
      @north = [@north, bbox["north"]].max
      @south = [@south, bbox["south"]].min
      # we don't know whether to add the other_bbox "to the left"
      # or "to the right". So we do three and choose whichever has a
      # smaller result (by side length). The three are: as is, moved
      # right by 360 degrees and moved left by 360 degrees.
      other_east = bbox["east"]
      other_west = bbox["west"]
      if other_east < other_west
        other_east += 360
      end
      @east, @west = optimize_east_west_add(other_east, other_west)
      normalize
    end

    # point is a hash with the keys "lng" and "lat"
    def add_point(point)
      # again, as with add_bbox(), we do not know whether to add the point
      # "to the left" or "to the right". So we do it three times:
      # as is, 360 to the left, 360 to the right, and choose the one
      # which minimizes the new side length
      @north = [@north, point["lat"].to_f].max
      @south = [@south, point["lat"].to_f].min
      lng = point["lng"].to_f
      @east, @west = optimize_east_west_add(lng, lng)
      normalize
    end

    def valid?
      @north == -90 && @south == 90 && @east == -180 && @west == 180
    end

    def is_point?
      @north == @south && @east == @west
    end

    private

    def normalize
      # make sure west is inside [-180,180]
      if @west > 180
        @west -= 360
        @east -= 360
      elsif @west < -180
        @west += 360
        @east += 360
      end
      # make sure east doesn't have any extra revolutions
      while @east >= @west + 360
        @east -= 360
      end
    end

    def optimize_east_west_add(other_east, other_west)
      new_east_asis = [@east, other_east].max
      new_west_asis = [@west, other_west].min
      side_length_asis = new_east_asis - new_west_asis

      new_east_toright = [@east, other_east + 360].max
      new_west_toright = [@west, other_west + 360].min
      side_length_toright = new_east_toright - new_west_toright

      new_east_toleft = [@east, other_east - 360].max
      new_west_toleft = [@west, other_west - 360].min
      side_length_toleft = new_east_toleft - new_west_toleft

      best = [side_length_asis, side_length_toleft, side_length_toright].min

      if best == side_length_asis
        return new_east_asis, new_west_asis
      elsif best == side_length_toright
        return new_east_toright, new_west_toright
      else
        return new_east_toleft, new_west_toleft
      end
    end
  end

  def initialize(cache_filename=nil)
    @cache = FileBackedCache.new(cache_filename)
  end

  def save
    @cache.save
  end

  def lookup_id(id)
    result = @cache.lookup(id.to_s) do
      result = load_feature_info(id)
      @cache.insert(id.to_s, result)
    end
    result
  end

  def lookup_name(place_name)
    id = @cache.lookup(place_name) do
      id = find_name_in_geonames(place_name)
      @cache.insert(place_name, id)
    end
    return {} if id.nil?
    lookup_id(id)
  end

  private

  def find_name_in_geonames(place_name)
    data = RestClient.get 'http://api.geonames.org/searchJSON',
      { params: { name: place_name, username: 'banu' }}
    result = JSON.parse(data)
    if result['totalResultsCount'] == 0
      STDERR.puts "No location found for: '#{place_name}'"
      id = nil
    elsif result['totalResultsCount'] == 1
      id = result['geonames'].first['geonameId']
    else
      # We could try to find the result with the best feature class and type.
      # Instead we take the first result geonames gives us.
      # Lets see how well that does.
      STDERR.puts "More than one result for: '#{place_name}'"
      id = result['geonames'].first['geonameId']
    end
    id
  end

  def load_feature_info(geoname_id)
    data = RestClient.get 'http://api.geonames.org/getJSON',
      { params: { geonameId: geoname_id, username: 'banu' }}
    JSON.parse(data)
  end
end
