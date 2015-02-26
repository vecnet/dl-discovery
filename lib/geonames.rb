
require 'json'
require 'rest_client'

#
# Convert place names to geoname ids and coordinates.
# While geonames does most of the work, we try to cache data
# as much as possible to decrease the number of lookups.
# Our cache stores both items of the form 'place name' => 'geoname id'
# as well as 'geoname id' => 'hash of location information'.
# This way we don't rely on the original place name as being a cannonical
# lookup for the geoname id.
#
# usage:
#

class Geonames
  class Cache
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

    def lookup(key)
      @cache[key]
    end

    def insert(key, value)
      @cache[key] = value
    end
  end

  class Bbox
    # we store the west and east in a normalized form satisfying the
    # invariant west <= east <= west + 360
    # (unless we are uninitialized, in which case east < west).
    # We will keep west in the range [-180, 180], and east
    # in the range [-180, 540]. The values > 180 indicate this bbox
    # crosses the anti-meridian.
    #
    # This comes about since we are really dealing with representatives from
    # an equivalence class, and we don't know which one to pick.
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
      # or "to the right". So we do three and choose which ever has a
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
      lat = point["lng"].to_f
      @east, @west = optimize_east_west_add(lat, lat)
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
    @cache = Cache.new(cache_filename)
  end

  def save
    @cache.save
  end

  def lookup_name(place_name)
    id = @cache.lookup(place_name)
    if id.nil?
      id = find_name_in_geonames(place_name)
      @cache.insert(place_name, id)
    end
    return {} if id.nil?
    result = @cache.lookup(id.to_s)
    if result.nil?
      result = load_feature_info(id)
      @cache.insert(id.to_s, result)
    end
    result
  end

  private

  def find_name_in_geonames(place_name)
    data = RestClient.get 'http://api.geonames.org/searchJSON',
      { params: { name: place_name, username: 'banu' }}
    result = JSON.parse(data)
    if result['totalResultsCount'] == 0
      id = nil
    elsif result['totalResultsCount'] == 1
      id = result['geonames'].first['geonameId']
    else
      # We could try to find the result with the best feature class and type.
      # Instead we take the first result geonames gives us. Lets see how well that does.
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
