//Convert HEX to UTF8
function hexToUtf8(s)
{
  return decodeURIComponent(
     s.replace(/\s+/g, '') // remove spaces
      .replace(/[0-9A-F]{2}/g, '%$&') // add '%' before each 2 characters
  );
}
var isOpened = true;
//Main message handler..
MDS.init(function(msg){
		MDS.log("event: "+msg);


	switch (msg.event) {
        case "inited":

			var listing = `create table if not exists LISTING (
				"listing_id" varchar(343) primary key,
				"title" varchar(50) NOT NULL,
				"price" INT NOT NULL,
				"created_by_pk" varchar(330) NOT NULL,
				"created_by_name" char(50),
				"sent_by_pk" varchar(330),
				"sent_by_name" char(50),
				"created_at" int not null,
				"wallet_address" varchar(80) not null,
				"status" char(12) not null default 'available',
				"buyer_message" varchar(1000),
				"buyer_name" char(50),
				"buyer_pk" varchar(330),
				"purchase_code" varchar(30),
				"coin_id" varchar(80),
				"notification" boolean default false,
				"collection" boolean default false,
				"delivery" boolean default false,
				"image"  varchar(max),
				"description" varchar(1500),
				"location" varchar(50),
				"shipping_cost" int,
				"shipping_countries" varchar(150),
				"transmission_type" varchar(10),
				constraint UQ_listing_id unique("listing_id"))`;

				MDS.sql(listing, function (res) {
					MDS.log(`MDS.SQL, ${listing}`);
					MDS.log(res);
				});

				var settings = `create table if not exists SETTINGS (
					"pk" varchar(330),
					"name" varchar(50),
					CONSTRAINT AK_name UNIQUE("name"),
					CONSTRAINT AK_pk UNIQUE("pk")
					)`;

					MDS.sql(settings, function (res) {
						MDS.log(`MDS.SQL, ${settings}`);
						MDS.log(res);
					});
					var pubkey='pubkey';
					var cname ='contact name';
						MDS.cmd('maxima', function (res) {
						if (res.status) {
							pubkey = res.response.publickey;
							cname = res.response.name;

						}
					})



				    var  fullsql = `insert into SETTINGS("name", "pk") values('${cname}', '${pubkey}');`;
					MDS.log(`Store added to settings: ${cname}`);
					MDS.sql(fullsql, function (res) {
						MDS.log(`MDS.SQL, ${fullsql}`);
						MDS.log(res);
					});
          break;
        case "MAXIMA":
          //MDS.log(`recieved maxima message:${JSON.stringify(msg)}`);
              //Get the data packet..
		var datastr = msg.data.data;
		if (datastr.startsWith("0x")) {
			datastr = datastr.substring(2);
		}

		//The JSON
		var jsonstr = hexToUtf8(datastr);
		//And create the actual JSON
		var entity = JSON.parse(jsonstr);
		if(!isOpened){
			MDS.notify(entity.sent_by_name + '\n' + entity.title);
		}
		//determine what type of message you're receiving
			switch (entity.type) {
				case 'listing':
					//a contact has shared a listing with you
					var randomId = Math.trunc(Math.random() * 10000000000000000);
					var id = `${randomId}${entity.created_by_pk}`;
					var timestamp = Math.floor(Date.now() / 1000);

					var instSql = `insert into LISTING
						(
							"listing_id",
							"title",
							"price",
							"collection",
							"delivery",
							"created_by_pk",
							"created_by_name",
							${entity.sent_by_name ? '"sent_by_name",' : ''}
							${ entity.sent_by_pk ? '"sent_by_pk",' : ''}
							"wallet_address",
							${ entity.sent_by_pk ? '"status",' : ''}
							"image",
							"description",
							${entity.location ? '"location",' : ''}
							${entity.shipping_cost ? '"shipping_cost",' : ''}
							${entity.shipping_countries ? '"shipping_countries",' : ''}
							"created_at"
						)
				
						values(
							${entity.listing_id ? `'${entity.listing_id}',` : `'${id}',`}
							'${entity.title}',
							'${entity.price}',
							'${entity.collection}',
							'${entity.delivery}',
							'${entity.created_by_pk}',
							'${entity.created_by_name}',
							${entity.sent_by_name ? `'${entity.sent_by_name}',` : ''}
							${entity.sent_by_pk ? `'${entity.sent_by_pk}',` : ''}
							'${entity.wallet_address}',
							${entity.sent_by_pk ? `'unchecked',` : ''}
							'${entity.image}',
							'${entity.description}',
							${entity.location ? `'${entity.location}',` : ''}
							${entity.shipping_cost ? `'${entity.shipping_cost}',` : ''}
							${entity.shipping_countries ? `'${entity.shipping_countries}',` : ''}
							${entity.created_at ? `'${entity.created_at}'` : `'${timestamp}'`}
						);`;

						MDS.sql(instSql, function (res) {
							MDS.log(`MDS.SQL, ${instSql}`);
							MDS.log(res);
						});
				break;
			default:
				MDS.log(entity);
			}
        break;
        case "NEWBLOCK":
          //processNewBlock(msg.data);
          break;
        default:
          MDS.log("default: "+msg.event);
		
      }


});

MDS.init(function(msg){
    MDS.log("event: "+msg);
        switch (msg.event) {
            case "inited":
                createListingTable();
                break;
            default:
              break;
        }
  });