package com.affinity.persistence;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;
 
@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Endorsement {
 
	@PrimaryKey @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY) 
	private Long id;
	
	@Persistent
    private String endorsementId; // endorsementForId + endorsedById + endorsed Character Id

	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}


	public String getEndorsementId() {
		return endorsementId;
	}


	public void setEndorsementId(String endorsementId) {
		this.endorsementId = endorsementId;
	}


	public String getCharacterId() {
		return characterId;
	}


	public void setCharacterId(String characterId) {
		this.characterId = characterId;
	}


	public String getEndorsementForId() {
		return endorsementForId;
	}


	public void setEndorsementForId(String endorsementForId) {
		this.endorsementForId = endorsementForId;
	}


	public String getEndorsementForName() {
		return endorsementForName;
	}


	public void setEndorsementForName(String endorsementForName) {
		this.endorsementForName = endorsementForName;
	}


	public String getEndorsedById() {
		return endorsedById;
	}


	public void setEndorsedById(String endorsedById) {
		this.endorsedById = endorsedById;
	}


	public String getEndorsedByName() {
		return endorsedByName;
	}


	public void setEndorsedByName(String endorsedByName) {
		this.endorsedByName = endorsedByName;
	}


	public String getHasViewed() {
		return hasViewed;
	}


	public void setHasViewed(String hasViewed) {
		this.hasViewed = hasViewed;
	}


	public Date getEndorsementDate() {
		return endorsementDate;
	}


	public void setEndorsementDate(Date endorsementDate) {
		this.endorsementDate = endorsementDate;
	}


	@Persistent
    private String characterId ;
	
    @Persistent
    private String endorsementForId; //
    
    @Persistent
    private String endorsementForName; //

	@Persistent
    private String endorsedById; //
    
    @Persistent
    private String endorsedByName; //
	
 	@Persistent
	private String hasViewed ; // Can be anonymous
	
	@Persistent
	private Date endorsementDate ; // Can be anonymous
	

	public Endorsement() {
		super();
    }


}