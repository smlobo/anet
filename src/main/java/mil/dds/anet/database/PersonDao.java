package mil.dds.anet.database;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import com.google.common.base.Joiner;
import com.google.common.collect.Sets;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.database.mappers.OrganizationMapper;
import mil.dds.anet.database.mappers.PersonMapper;
import mil.dds.anet.utils.DaoUtils;

public class PersonDao implements IAnetDao<Person> {

	Handle dbHandle;
	
	public PersonDao(Handle h) { 
		this.dbHandle = h;
	}
	
	public List<Person> getAll(int pageNum, int pageSize) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "SELECT * FROM people ORDER BY createdAt ASC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else { 
			sql = "SELECT * from people ORDER BY createdAt ASC LIMIT :limit OFFSET :offset";
		}
		Query<Person> query = dbHandle.createQuery(sql)
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new PersonMapper());
		return query.list();
	}

	public Person getById(int id) { 
		Query<Person> query = dbHandle.createQuery("select * from people where id = :id")
				.bind("id",  id)
				.map(new PersonMapper());
		List<Person> rs = query.list();
		if (rs.size() == 0) { return null; } 
		return rs.get(0);
	}
	
	public Person insert(Person p){
		p.setCreatedAt(DateTime.now());
		p.setUpdatedAt(DateTime.now());
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement("INSERT INTO people " +
				"(name, status, role, emailAddress, phoneNumber, rank, pendingVerification, "
				+ "biography, domainUsername, createdAt, updatedAt) " +
				"VALUES (:name, :status, :role, :emailAddress, :phoneNumber, :rank, :pendingVerification, "
				+ ":biography, :domainUsername:createdAt, :updatedAt);")
			.bindFromProperties(p)
			.bind("status", DaoUtils.getEnumId(p.getStatus()))
			.bind("role", DaoUtils.getEnumId(p.getRole()))
			.executeAndReturnGeneratedKeys();
		p.setId(DaoUtils.getGeneratedId(keys));
		return p;
	}
	
	public int update(Person p){
		p.setUpdatedAt(DateTime.now());
		return dbHandle.createStatement("UPDATE people " + 
				"SET name = :name, status = :status, role = :role, " + 
				"phoneNumber = :phoneNumber, rank = :rank, biography = :biography, " +
				"pendingVerification = :pendingVerification, updatedAt = :updatedAt "
				+ "WHERE id = :id")
			.bindFromProperties(p)
			.bind("status", DaoUtils.getEnumId(p.getStatus()))
			.bind("role", DaoUtils.getEnumId(p.getRole()))
			.execute();
	}
	
	/**
	 * Searches all people by name regardless of role in the system. 
	 */
	public List<Person> searchByName(String searchQuery) { 
		return searchByName(searchQuery, null);
	}
	
	public List<Person> searchByName(String searchQuery, Role role) {
		StringBuilder queryBuilder = new StringBuilder("SELECT * FROM people WHERE ");
		if (DaoUtils.isMsSql(dbHandle)) { 
			searchQuery = "\"" + searchQuery + "*\"";
			queryBuilder.append("CONTAINS (name, :query)");
		} else { 
			queryBuilder.append("name LIKE '%' || :query || '%' ");
		}
		if (role != null ) { 
			queryBuilder.append(" AND role = :role");
		}
		Query<Person> query = dbHandle.createQuery(queryBuilder.toString())
			.bind("query", searchQuery)
			.bind("role", (role != null) ? role.ordinal() : null)
			.map(new PersonMapper());
		return query.list();
	}
	
	public Organization getOrganizationForPerson(int personId) { 
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "SELECT TOP(1)organizations.* " +
					"FROM organizations, positions, peoplePositions WHERE " + 
					"peoplePositions.personId = :personId AND peoplePositions.positionId = positions.id " + 
					"AND positions.organizationId = organizations.id " + 
					"ORDER BY peoplePositions.createdAt DESC";
		} else { 
			sql = "SELECT organizations.* " +
					"FROM organizations, positions, peoplePositions WHERE " + 
					"peoplePositions.personId = :personId AND peoplePositions.positionId = positions.id " + 
					"AND positions.organizationId = organizations.id " + 
					"ORDER BY peoplePositions.createdAt DESC LIMIT 1";
		}
		
		Query<Organization> query = dbHandle.createQuery(sql)
			.bind("personId", personId)
			.map(new OrganizationMapper());
		List<Organization> rs = query.list();
		if (rs.size() == 0) { return null; } 
		return rs.get(0);
	}

	public List<Person> findByProperty(String ...strings) {
		if (strings.length % 2 != 0 ) { throw new RuntimeException("Illegal number of arguments to findByProperty: " + strings.toString()); }
		HashSet<String> props = Sets.newHashSet("name","emailAddress","rank","phoneNumber","status", "domainUsername");
		List<String> conditions = new ArrayList<String>();
		
		for (int i=0;i<strings.length;i+=2) { 
			if (props.contains(strings[i])) { 
				conditions.add(strings[i] + " = ? ");
			}
		}
		String queryString = "SELECT * from people WHERE " + Joiner.on(" AND ").join(conditions);
		Query<Map<String, Object>> query = dbHandle.createQuery(queryString);
		for (int i=0;i<strings.length;i+=2) { 
			query.bind((i/2), strings[i+1]);
		}
		return query.map(new PersonMapper()).list();
	}

}
