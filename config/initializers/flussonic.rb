
db_conf = YAML::load(File.open(File.join(Rails.root,'config','database.yml')))

FlussonicDB = db_conf["#{Rails.env}_flussonic"]